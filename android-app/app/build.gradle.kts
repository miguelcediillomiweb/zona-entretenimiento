plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
}

val stableKeystoreFile = file("zona-release.jks")

android {
    namespace = "mx.cedillo.zonaentretenimiento"
    compileSdk = 36

    defaultConfig {
        applicationId = "mx.cedillo.zonaentretenimiento"
        minSdk = 23
        targetSdk = 35
        versionCode = 4
        versionName = "1.3.0"
    }

    signingConfigs {
        if (stableKeystoreFile.exists()) {
            create("stable") {
                storeFile = stableKeystoreFile
                storePassword = System.getenv("ANDROID_STORE_PASSWORD")
                keyAlias = System.getenv("ANDROID_KEY_ALIAS")
                keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        getByName("debug") {
            if (stableKeystoreFile.exists()) {
                signingConfig = signingConfigs.getByName("stable")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("com.onesignal:OneSignal:5.11.0")
}
