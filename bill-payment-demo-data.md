# Bill Payment Demo Data

Đây là file chứa data mẫu để test Bill Payment UI

## Categories Sample:
```json
{
  "success": true,
  "data": [
    {
      "billCategoryId": 1,
      "categoryName": "Điện",
      "description": "Hóa đơn tiền điện"
    },
    {
      "billCategoryId": 2,
      "categoryName": "Nước",
      "description": "Hóa đơn tiền nước"
    },
    {
      "billCategoryId": 3,
      "categoryName": "Internet/WiFi",
      "description": "Cước internet và wifi"
    },
    {
      "billCategoryId": 4,
      "categoryName": "Học phí",
      "description": "Học phí trường đại học, cao đẳng"
    },
    {
      "billCategoryId": 5,
      "categoryName": "Điện thoại di động",
      "description": "Cước điện thoại di động"
    },
    {
      "billCategoryId": 6,
      "categoryName": "Truyền hình",
      "description": "Gói truyền hình cáp, vệ tinh"
    }
  ]
}
```

## Providers Sample (for Điện):
```json
{
  "success": true,
  "data": [
    {
      "billProviderId": 1,
      "providerName": "Công ty Điện lực TP.HCM (EVN HCMC)",
      "providerCode": "EVN_HCMC"
    },
    {
      "billProviderId": 2,
      "providerName": "Công ty Điện lực Hà Nội (EVN HN)",
      "providerCode": "EVN_HN"
    },
    {
      "billProviderId": 3,
      "providerName": "Điện lực Đà Nẵng (EVN DN)",
      "providerCode": "EVN_DN"
    }
  ]
}
```

## Bill Info Sample:
```json
{
  "success": true,
  "data": {
    "customerName": "Nguyễn Văn A",
    "customerCode": "PD12345678",
    "billingPeriod": "03/2026",
    "amount": 420000,
    "dueDate": "2026-04-15"
  }
}
```

## User Cards Sample:
```json
{
  "success": true,
  "data": [
    {
      "cardId": 1,
      "cardNumber": "4532123456789012",
      "cardType": {
        "cardName": "MasterCredit Platinum"
      },
      "status": "Active"
    }
  ]
}
```