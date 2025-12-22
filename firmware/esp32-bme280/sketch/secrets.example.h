// Copy the following to create `secrets.h` file.
// `secrets.h` contains sensitive information and should be excluded from Git.

// Hono API endpoint
#define HONO_API_URL    "http://192.168.1.1:8787/measurements"

// deviceId (devices.deviseId)
#define DEVICE_ID       "device-001"

// jwt secret (devices.secret)
#define DEVICE_SECRET   "super-secret-value"
