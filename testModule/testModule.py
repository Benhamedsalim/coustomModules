from odoo import fields, models

class TestFieldModule(models.Model):
    _name = 'product.template'
    _inherit = 'product.template'
    _description = 'Test module'

    product_weight = fields.Integer('وزن الوجبة')
    calories = fields.Integer('عدد السعرات الحرارية')
    expiry_date = fields.Date('تاريخ إنتهاء الصلاحية')
