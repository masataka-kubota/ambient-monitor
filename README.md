# ambient-monitor

環境センサー（温度・湿度・気圧など）を ESP32 で取得し、HiveMQ 経由で Cloudflare Workers + Hono バックエンドに送信、D1 に保存して TanStack Start フロントで可視化するプロジェクトです。

---

## プロジェクト構成

```
ambient-monitor/
├─ .gitignore
├─ README.md
├─ frontend/       # TanStack Start + Cloudflare Workers
├─ backend/        # Hono + Cloudflare Workers
└─ firmware/       # Sketch for ESP32
    └─ esp32-bme280/
      └─ sketch/
        ├─ sketch.ino
        └─ secrets.example.h   # Actual values are copied to `secrets.h`

```

---

- **frontend/**

  - TanStack Start で構築したフロントアプリ
  - API 経由で D1 のデータを取得してグラフ表示

- **backend/**

  - Hono を使った Cloudflare Workers アプリ
  - HiveMQ Webhook を受信して D1 にデータ保存

- **firmware/**
  - ESP32 スケッチ
  - BME280 から温度・湿度・気圧を取得して MQTT で HiveMQ に送信
  - `secrets.example.h` をコピーして `secrets.h` に本番値を設定

---

## 開発手順

### 1. ESP32 スケッチ準備

1. `firmware/esp32-bme280/sketch/secrets.example.h` をコピーして `secrets.h` を作成
2. Wi-Fi 情報と HiveMQ、サーバー証明書の認証情報を入力
3. Arduino IDE でアップロード

### 2. Hono バックエンド

1. `backend/` に移動
2. 必要な環境変数を設定
   ```bash
   wrangler secret put D1_DATABASE
   wrangler secret put HIVEMQ_WEBHOOK_SECRET
   ```
