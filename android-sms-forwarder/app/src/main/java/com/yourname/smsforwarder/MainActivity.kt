package com.yourname.smsforwarder

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.content.SharedPreferences

class MainActivity : AppCompatActivity() {
    private lateinit var etApiUrl: EditText
    private lateinit var btnSaveUrl: Button
    private lateinit var tvStatus: TextView
    private lateinit var sharedPrefs: SharedPreferences
    
    private val SMS_PERMISSION_REQUEST_CODE = 100
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        initViews()
        setupSharedPrefs()
        requestSmsPermissions()
        loadSavedApiUrl()
        
        btnSaveUrl.setOnClickListener {
            saveApiUrl()
        }
    }
    
    private fun initViews() {
        etApiUrl = findViewById(R.id.etApiUrl)
        btnSaveUrl = findViewById(R.id.btnSaveUrl)
        tvStatus = findViewById(R.id.tvStatus)
    }
    
    private fun setupSharedPrefs() {
        sharedPrefs = getSharedPreferences("sms_forwarder_prefs", MODE_PRIVATE)
    }
    
    private fun requestSmsPermissions() {
        val permissions = arrayOf(
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS
        )
        
        val permissionsNeeded = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        
        if (permissionsNeeded.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                permissionsNeeded.toTypedArray(),
                SMS_PERMISSION_REQUEST_CODE
            )
        } else {
            updateStatus("SMS permissions granted")
        }
    }
    
    private fun saveApiUrl() {
        val apiUrl = etApiUrl.text.toString().trim()
        if (apiUrl.isNotEmpty()) {
            sharedPrefs.edit().putString("api_url", apiUrl).apply()
            Toast.makeText(this, "API URL saved", Toast.LENGTH_SHORT).show()
            updateStatus("API URL configured")
        } else {
            Toast.makeText(this, "Please enter a valid API URL", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun loadSavedApiUrl() {
        val savedUrl = sharedPrefs.getString("api_url", "")
        etApiUrl.setText(savedUrl)
        if (!savedUrl.isNullOrEmpty()) {
            updateStatus("API URL loaded from preferences")
        }
    }
    
    private fun updateStatus(status: String) {
        tvStatus.text = "Status: $status"
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        when (requestCode) {
            SMS_PERMISSION_REQUEST_CODE -> {
                val allPermissionsGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
                if (allPermissionsGranted) {
                    updateStatus("All SMS permissions granted")
                    Toast.makeText(this, "SMS permissions granted successfully", Toast.LENGTH_SHORT).show()
                } else {
                    updateStatus("SMS permissions denied")
                    Toast.makeText(this, "SMS permissions are required for the app to work", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
