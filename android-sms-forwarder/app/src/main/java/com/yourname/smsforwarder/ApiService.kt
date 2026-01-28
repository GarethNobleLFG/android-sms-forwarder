package com.yourname.smsforwarder

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class ApiService(private val context: Context) {
    
    companion object {
        private const val TAG = "ApiService"
        private const val TIMEOUT_MS = 10000
    }
    
    suspend fun forwardSms(smsData: SmsData): Boolean = withContext(Dispatchers.IO) {
        try {
            val apiUrl = getApiUrl()
            if (apiUrl.isEmpty()) {
                Log.w(TAG, "API URL not configured")
                return@withContext false
            }
            
            val jsonPayload = createJsonPayload(smsData)
            val response = sendHttpRequest(apiUrl, jsonPayload)
            
            Log.d(TAG, "API Response: $response")
            return@withContext true
            
        } catch (e: Exception) {
            Log.e(TAG, "Error forwarding SMS to API", e)
            return@withContext false
        }
    }
    
    private fun getApiUrl(): String {
        val sharedPrefs = context.getSharedPreferences("sms_forwarder_prefs", Context.MODE_PRIVATE)
        return sharedPrefs.getString("api_url", "") ?: ""
    }
    
    private fun createJsonPayload(smsData: SmsData): String {
        val jsonObject = JSONObject().apply {
            put("sender", smsData.sender)
            put("message", smsData.message)
            put("timestamp", smsData.timestamp)
            put("device_id", smsData.deviceId)
            put("received_at", System.currentTimeMillis())
        }
        return jsonObject.toString()
    }
    
    private fun sendHttpRequest(apiUrl: String, jsonPayload: String): String {
        val url = URL(apiUrl)
        val connection = url.openConnection() as HttpURLConnection
        
        try {
            connection.apply {
                requestMethod = "POST"
                doOutput = true
                doInput = true
                connectTimeout = TIMEOUT_MS
                readTimeout = TIMEOUT_MS
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                setRequestProperty("User-Agent", "SMS-Forwarder-Android/1.0")
            }
            
            // Send JSON payload
            OutputStreamWriter(connection.outputStream).use { writer ->
                writer.write(jsonPayload)
                writer.flush()
            }
            
            val responseCode = connection.responseCode
            Log.d(TAG, "HTTP Response Code: $responseCode")
            
            // Read response
            val response = if (responseCode == HttpURLConnection.HTTP_OK) {
                connection.inputStream.bufferedReader().readText()
            } else {
                connection.errorStream?.bufferedReader()?.readText() ?: "No error message"
            }
            
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw Exception("HTTP Error $responseCode: $response")
            }
            
            return response
            
        } finally {
            connection.disconnect()
        }
    }
}
