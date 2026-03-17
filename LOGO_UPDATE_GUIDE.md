# Logo Update Instructions - MasterCredit

## 📋 Đã cập nhật logo cho các trang sau:

✅ **LandingPage.jsx** - Logo chính và logo trong phone mockup
✅ **PublicCardsPage.jsx** - Header logo
✅ **CardDetailPage.jsx** - Logo cho cả logged-in và public layout
✅ **CardCatalogPage.jsx** - Sidebar logo
✅ **CardsPage.jsx** - Sidebar logo
✅ **DashboardPage.jsx** - Sidebar logo
✅ **ChatPage.jsx** - Sidebar logo
✅ **LoginPage.jsx** - Header logo
✅ **RegisterPage.jsx** - Header logo
✅ **CardComparePage.jsx** - Sidebar logo

## 🛠️ Component Logo đã tạo:

📄 **`src/components/Logo.jsx`** - Component tái sử dụng với:
- Props: `className`, `showText`, `textSize`
- Fallback tự động về logo cũ nếu ảnh lỗi
- Hỗ trợ hiển thị/ẩn text "MasterCredit"

## 📁 Hướng dẫn đặt file logo:

### Bước 1: Đặt file logo
```
public/
├── logo.png    👈 Đặt logo mới vào đây
├── index.html
└── ...
```

### Bước 2: Format logo khuyến nghị
- **Định dạng**: PNG với nền trong suốt
- **Kích thước**: 128x128px hoặc lớn hơn (vuông)
- **Tối ưu**: Logo rõ nét ở kích thước nhỏ (32x32px)

### Bước 3: Thay đổi tên file (nếu cần)
Nếu logo có tên khác `logo.png`, cập nhật trong `src/components/Logo.jsx`:
```jsx
<img
  src="/your-logo-name.png"  // 👈 Thay đổi ở đây
  alt="MasterCredit Logo"
  // ...
```

## 🔄 Cách thức hoạt động:

1. **Logo mới**: Hiển thị từ `/public/logo.png`
2. **Fallback**: Nếu logo lỗi → tự động hiển thị logo cũ (chữ "M" cam)
3. **Responsive**: Tự động điều chỉnh kích thước theo props
4. **Consistent**: Sử dụng cùng 1 component cho toàn bộ app

## 🎯 Sizes đã sử dụng:

- **Header chính**: `w-10 h-10` (40x40px)
- **Sidebar**: `w-8 h-8` (32x32px)
- **Phone mockup**: `w-8 h-8` (32x32px)

## 🚀 Kết quả:

- ✅ Tất cả 10 trang đã sử dụng logo mới
- ✅ Component tái sử dụng dễ bảo trì
- ✅ Fallback an toàn nếu lỗi
- ✅ Tương thích với responsive design
- ✅ Branding nhất quán trên toàn bộ app

**Ghi chú**: Chỉ cần đặt file `logo.png` vào thư mục `public/` và refresh trang để thấy logo mới!