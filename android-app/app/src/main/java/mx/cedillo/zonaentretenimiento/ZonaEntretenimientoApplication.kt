package mx.cedillo.zonaentretenimiento

import android.app.Application
import com.onesignal.OneSignal

class ZonaEntretenimientoApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // Se reutiliza la aplicación OneSignal existente.
        // La entrega Android quedará activa al configurar FCM en ese panel.
        OneSignal.initWithContext(this, "7aba97c6-14da-43b9-bddb-89aa766d321e")
    }
}
