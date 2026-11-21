package mx.cedillo.zonaentretenimiento

import android.app.Activity
import android.content.Intent
import android.content.SharedPreferences
import android.content.res.ColorStateList
import android.net.Uri
import android.os.Bundle
import android.text.InputFilter
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import com.onesignal.OneSignal
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

class MainActivity : Activity() {
    private val websiteUrl = "https://miguelcediillomiweb.github.io/zona-entretenimiento/?origen=app"
    private val controlUrl = "https://raw.githubusercontent.com/miguelcediillomiweb/zona-entretenimiento/app-android-separada/android-app/app-config.json"
    private val licenseApiUrl = "https://script.google.com/macros/s/AKfycbwQrvK12mmCnHbideA0C-NZm1C1DvIIYjrvC-IhePZ1yHOv1uzpQPqIotMi3YE3r5P_/exec"
    private val internalHost = "miguelcediillomiweb.github.io"
    private val prefsName = "zona_entertainment_license"
    private val offlineGraceMs = 72L * 60L * 60L * 1000L

    private lateinit var root: LinearLayout
    private var webViewActual: WebView? = null

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (intent.data?.scheme == "zonaentretenimiento") {
            webViewActual?.loadUrl(websiteUrl)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.decorView.systemUiVisibility =
            (View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION)

        root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(0xFF101025.toInt())
        }
        setContentView(root)

        showLoading("Comprobando la aplicación...")

        Thread {
            val config = readRemoteConfig()
            runOnUiThread {
                if (config.optBoolean("enabled", true)) {
                    verifySavedLicense()
                } else {
                    showSuspended(
                        config.optString(
                            "message",
                            "La aplicación está temporalmente en mantenimiento. Intenta más tarde."
                        )
                    )
                }
            }
        }.start()
    }

    private fun licensePrefs(): SharedPreferences =
        getSharedPreferences(prefsName, MODE_PRIVATE)

    private fun getDeviceId(): String {
        val prefs = licensePrefs()
        val saved = prefs.getString("device_id", null)
        if (!saved.isNullOrBlank()) return saved

        val created = UUID.randomUUID().toString()
        prefs.edit().putString("device_id", created).apply()
        return created
    }

    private fun verifySavedLicense() {
        val prefs = licensePrefs()
        val code = prefs.getString("license_code", null)

        if (code.isNullOrBlank()) {
            showActivationScreen("Esta aplicación necesita una licencia para continuar.")
            return
        }

        showLoading("Verificando tu licencia...")
        Thread {
            val response = sendLicenseRequest("check", code)
            runOnUiThread {
                if (response != null && response.optBoolean("ok", false)) {
                    prefs.edit().putLong("last_validated", System.currentTimeMillis()).apply()
                    openWebsite()
                } else if (response != null) {
                    prefs.edit().remove("license_code").apply()
                    showActivationScreen(
                        response.optString("error", "La licencia no está autorizada.")
                    )
                } else {
                    val lastValidated = prefs.getLong("last_validated", 0L)
                    val withinGrace = lastValidated > 0L &&
                        System.currentTimeMillis() - lastValidated <= offlineGraceMs

                    if (withinGrace) {
                        openWebsite()
                    } else {
                        showActivationScreen(
                            "No pudimos conectar con el servidor para verificar tu licencia. " +
                                "Revisa tu conexión e inténtalo nuevamente."
                        )
                    }
                }
            }
        }.start()
    }

    private fun activateLicense(code: String, button: Button, message: TextView) {
        button.isEnabled = false
        message.text = "Comprobando el código..."

        Thread {
            val response = sendLicenseRequest("activate", code)
            runOnUiThread {
                button.isEnabled = true

                if (response != null && response.optBoolean("ok", false)) {
                    licensePrefs().edit()
                        .putString("license_code", code)
                        .putLong("last_validated", System.currentTimeMillis())
                        .apply()
                    showLoading("Licencia activada. Abriendo catálogo...")
                    openWebsite()
                } else {
                    message.text = response?.optString(
                        "error",
                        "No se pudo activar la licencia."
                    ) ?: "No se pudo conectar. Revisa tu internet e inténtalo de nuevo."
                }
            }
        }.start()
    }

    private fun sendLicenseRequest(action: String, code: String): JSONObject? {
        var connection: HttpURLConnection? = null

        return try {
            connection = (URL(licenseApiUrl).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 15000
                readTimeout = 20000
                doOutput = true
                instanceFollowRedirects = true
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
                setRequestProperty("Accept", "application/json")
            }

            val body = JSONObject()
                .put("action", action)
                .put("code", code)
                .put("deviceId", getDeviceId())
                .toString()

            connection.outputStream.use {
                it.write(body.toByteArray(Charsets.UTF_8))
            }

            val responseCode = connection.responseCode
            val stream = if (responseCode in 200..299) {
                connection.inputStream
            } else {
                connection.errorStream
            } ?: return null

            val responseText = stream.bufferedReader(Charsets.UTF_8).use { it.readText() }
            JSONObject(responseText)
        } catch (_: Exception) {
            null
        } finally {
            connection?.disconnect()
        }
    }

    private fun readRemoteConfig(): JSONObject {
        return try {
            val connection = (URL(controlUrl).openConnection() as HttpURLConnection).apply {
                connectTimeout = 5000
                readTimeout = 5000
                requestMethod = "GET"
                setRequestProperty("Cache-Control", "no-cache")
            }
            val text = connection.inputStream.bufferedReader().use { it.readText() }
            connection.disconnect()
            JSONObject(text)
        } catch (_: Exception) {
            JSONObject().put("enabled", true)
        }
    }

    private fun showLoading(message: String) {
        root.removeAllViews()
        root.gravity = Gravity.CENTER
        val text = TextView(this).apply {
            this.text = "🎬 Zona Entretenimiento\n\n$message"
            textSize = 18f
            setTextColor(0xFFFFFFFF.toInt())
            gravity = Gravity.CENTER
            setPadding(dp(28), dp(28), dp(28), dp(28))
        }
        root.addView(
            text,
            LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        )
    }

    private fun showActivationScreen(initialMessage: String) {
        root.removeAllViews()
        root.gravity = Gravity.CENTER
        root.setPadding(dp(28), dp(24), dp(28), dp(24))

        val title = TextView(this).apply {
            text = "🎬 Zona Entretenimiento"
            textSize = 25f
            setTextColor(0xFFFFFFFF.toInt())
            gravity = Gravity.CENTER
        }

        val description = TextView(this).apply {
            text = "Ingresa tu código de licencia para activar esta aplicación en este teléfono."
            textSize = 16f
            setTextColor(0xFFD8D8E8.toInt())
            gravity = Gravity.CENTER
            setPadding(0, dp(18), 0, dp(22))
        }

        val input = EditText(this).apply {
            hint = "XXXX-XXXX-XXXX"
            setSingleLine(true)
            textSize = 18f
            gravity = Gravity.CENTER
            inputType = InputType.TYPE_CLASS_TEXT or
                InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS or
                InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
            filters = arrayOf(InputFilter.LengthFilter(14))
            setTextColor(0xFFFFFFFF.toInt())
            setHintTextColor(0xFFAAAAAA.toInt())
            setPadding(dp(12), dp(14), dp(12), dp(14))
        }

        val message = TextView(this).apply {
            text = initialMessage
            textSize = 14f
            setTextColor(0xFFFFD166.toInt())
            gravity = Gravity.CENTER
            setPadding(0, dp(16), 0, dp(16))
        }

        val button = Button(this).apply {
            text = "ACTIVAR LICENCIA"
            textSize = 15f
            setTextColor(0xFFFFFFFF.toInt())
            backgroundTintList = ColorStateList.valueOf(0xFF2457C5.toInt())
            setOnClickListener {
                val code = input.text.toString().trim().uppercase()
                if (code.replace("-", "").length != 12) {
                    message.text = "Escribe el código completo de 12 caracteres."
                } else {
                    activateLicense(code, this, message)
                }
            }
        }

        root.addView(title)
        root.addView(description)
        root.addView(
            input,
            LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        )
        root.addView(message)
        root.addView(
            button,
            LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        )
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()

    private fun openWebsite() {
        root.removeAllViews()
        root.setPadding(0, 0, 0, 0)
        root.gravity = Gravity.NO_GRAVITY

        val webView = WebView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
            )
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.javaScriptCanOpenWindowsAutomatically = false
            settings.setSupportMultipleWindows(false)
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                    return openExternalLink(url)
                }

                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest
                ): Boolean {
                    return openExternalLink(request.url.toString())
                }

                override fun onPageFinished(view: WebView, url: String) {
                    super.onPageFinished(view, url)
                    view.evaluateJavascript(
                        "document.getElementById('install-banner')?.setAttribute('hidden','hidden');",
                        null
                    )
                }
            }
            loadUrl(websiteUrl)
        }

        webViewActual = webView
        root.addView(webView)

        CoroutineScope(Dispatchers.IO).launch {
            OneSignal.Notifications.requestPermission(false)
        }
    }

    private fun openExternalLink(rawUrl: String): Boolean {
        return try {
            val uri = Uri.parse(rawUrl)
            val scheme = uri.scheme?.lowercase()
            val host = uri.host?.lowercase()

            if (scheme == "https" && host == internalHost) return false

            val intent = if (scheme == "intent") {
                Intent.parseUri(rawUrl, Intent.URI_INTENT_SCHEME).apply {
                    addCategory(Intent.CATEGORY_BROWSABLE)
                    component = null
                    selector = null
                }
            } else {
                Intent(Intent.ACTION_VIEW, uri)
            }

            startActivity(intent)
            true
        } catch (_: Exception) {
            try {
                val uri = Uri.parse(rawUrl)
                if (uri.scheme == "https" || uri.scheme == "http") {
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                    true
                } else {
                    false
                }
            } catch (_: Exception) {
                false
            }
        }
    }

    private fun showSuspended(message: String) {
        root.removeAllViews()
        root.gravity = Gravity.CENTER
        val text = TextView(this).apply {
            this.text = "🎬 Zona Entretenimiento\n\n$message"
            textSize = 20f
            setTextColor(0xFFFFFFFF.toInt())
            gravity = Gravity.CENTER
            setPadding(32, 32, 32, 32)
        }
        root.addView(text)
    }
}
