package com.yourname.smsforwarder

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.SmsMessage
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class SmsReceiver : BroadcastReceiver() {
    
    companion object {
        private const val TAG = "SmsReceiver"
        private const val SMS_RECEIVED = "android.provider.Telephony.SMS_RECEIVED"
    }
    
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return
        
        if (SMS_RECEIVED == intent.action) {
            val bundle = intent.extras ?: return
            val pdus = bundle.get("pdus") as? Array<*> ?: return
            
            for (pdu in pdus) {
                val smsMessage = SmsMessage.createFromPdu(pdu as ByteArray)
                val sender = smsMessage.displayOriginatingAddress ?: "Unknown"
                val messageBody = smsMessage.messageBody ?: ""
                val timestamp = smsMessage.timestampMillis
                
                Log.d(TAG, "SMS received from: $sender")
                Log.d(TAG, "Message: $messageBody")
                
                // Parse and forward the SMS
                parseSmsAndForward(context, sender, messageBody, timestamp)
            }
        }
    }
    
    private fun parseSmsAndForward(
        context: Context,
        sender: String,
        messageBody: String,
        timestamp: Long
    ) {
        // Create SMS data object
        val smsData = SmsData(
            sender = sender,
            message = messageBody,
            timestamp = timestamp,
            deviceId = getDeviceId(context)
        )
        
        // Forward to API using coroutine
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apiService = ApiService(context)
                apiService.forwardSms(smsData)
                Log.d(TAG, "SMS forwarded successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to forward SMS", e)
            }
        }
    }
    
    private fun getDeviceId(context: Context): String {
        val sharedPrefs = context.getSharedPreferences("sms_forwarder_prefs", Context.MODE_PRIVATE)
        var deviceId = sharedPrefs.getString("device_id", null)
        
        if (deviceId == null) {
            // Generate a unique device ID
            deviceId = java.util.UUID.randomUUID().toString()
            sharedPrefs.edit().putString("device_id", deviceId).apply()
        }
        
        return deviceId
    }
}

data class SmsData(
    val sender: String,
    val message: String,
    val timestamp: Long,
    val deviceId: String
)
