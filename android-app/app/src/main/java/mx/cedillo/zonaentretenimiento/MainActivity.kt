package mx.cedillo.zonaentretenimiento

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import com.onesignal.OneSignal
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : Activity() {
    private val websiteUrl = "https://miguelcediillomiweb.github.io/zona-entretenimiento/?origen=app"
    private val controlUrl = "https://raw.githubusercontent.com/miguelcediillomiweb/zona-entretenimiento/app-android-separada/android-app/app-config.json"
    private lateinit var root: LinearLayout
    private val internalHost = "miguelcediillomi.github.io"
    private var webViewActual: WebView? = null

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
        if (intent?.data?.scheme == "zonaentretenimiento") {
            // El enlace de regreso desde Telegram abre el catálogo dentro de la APK.
        }

        Thread {
            val config = readRemoteConfig()
            runOnUiThread {
                if (config.optBoolean("enabled", true)) {
                    openWebsite()
                } else {
                    showSuspended(config.optString(
                        "message",
                        "La aplicación está temporalmente en mantenimiento. Intenta más tarde."
                    ))
                }
            }
        }.start()
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

    private fun openWebsite() {
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

                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
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
        root.gravity = android.view.Gravity.CENTER
        val text = TextView(this).apply {
            this.text = "🎬 Zona Entretenimiento\\n\\n$message"
            textSize = 20f
            setTextColor(0xFFFFFFFF.toInt())
            gravity = android.view.Gravity.CENTER
            setPadding(32, 32, 32, 32)
        }
        root.addView(text)
    }
}