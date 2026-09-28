# Test Module - Odoo 🍽️

وحدة Odoo لإضافة حقول مخصصة لنماذج المنتجات، مع تخصيص واجهات العرض والقوائم.

An Odoo module that extends the product template with custom fields, views, and a dedicated menu.

---

## ✨ المميزات | Features

- ⚖️ **وزن الوجبة** - حقل جديد لتسجيل وزن المنتج
- 🔥 **السعرات الحرارية** - حقل لتسجيل القيمة الغذائية
- 📅 **تاريخ انتهاء الصلاحية** - حقل لمتابعة صلاحية المنتج
- 🎨 **تخصيص الواجهات**:
  - إضافة الحقول في نموذج المنتج (Form View)
  - عرض الوزن في القائمة (Tree View)
  - عرض السعرات في Kanban View
  - فلتر "Large Meal" للوجبات التي تزيد عن 200 جرام
- 📋 **قائمة مخصصة** - "الوجبات الكبيرة" تحت قسم المخزون

---

## 🛠️ التقنيات | Tech Stack

| التقنية | الإصدار |
|---|---|
| Odoo | 16.0+ |
| Python | 3.8+ |
| XML | Odoo Views |

---

## 📦 الاعتماديات | Dependencies

- `sale` - لتتبع المبيعات
- `stock` - لإدارة المخزون
- `product` - النموذج الأساسي

---

## 📁 هيكل المشروع | Project Structure
product_nutrition/
├── init.py # استيراد الموديلات
├── manifest.py # تعريف الوحدة
├── testModule.py # الموديل (أو models.py)
├── view.xml # تخصيص الواجهات
└── README.md