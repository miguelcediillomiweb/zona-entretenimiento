package mx.cedillo.zonaentretenimiento

import android.app.Activity
import android.os.Bundle
import android.view.View
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : Activity() {
    private val websiteUrl = "https://miguelcediillomi.github.io/zona-entretenimiento/"
    private val controlUrl = "https://raw.githubusercontent.com/miguelcediillomi/zona-entretenimiento/app-android-separada/android-app/app-config.json"
    private lateinit var root: LinearLayout

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
            // Si el control remoto no responde, no bloqueamos a los usuarios.
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
            webViewClient = WebViewClient()
            loadUrl(websiteUrl)
        }
        root.addView(webView)
    }

    private fun showSuspended(message: String) {
        root.gravity = android.view.Gravity.CENTER
        val text = TextView(this).apply {
            this.text = "🎬 Zona Entretenimiento\n\n$message"
            textSize = 20f
            setTextColor(0xFFFFFFFF.toInt())
            gravity = android.view.Gravity.CENTER
            setPadding(32, 32, 32, 32)
        }
        root.addView(text)
    }
}
