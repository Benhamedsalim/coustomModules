# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.tools.populate import compute
from odoo.tools.view_validation import READONLY


class partner_meals(models.Model):
    _name = 'partners.meals'
    _description = 'meal group for partners'
    meal_name = fields.Selection([
        ('breakfast','وجبات الفطور'),
        ('lunch','وجبات الغداء'),
        ('dinner','وجبات العشاء')
    ], string='إسم الوجبة')
    partner_id = fields.Many2one('res.partner', string='إسم العميل')
    meal_datetime = fields.Datetime('وقت الوجبة')
    meal_note = fields.Text('ملاحظات')
    item_ids = fields.One2many('partners.meals.item', 'meal_id')
    total_price = fields.Float(string='المبلغ الإجمالي', compute='_calctotalprice', store=True)
    @api.depends('item_ids.meal_item_price')
    def _calctotalprice(self):
        for record in self:
            currentprice = 0
            for i in record.item_ids:
                currentprice = currentprice + i.meal_item_price
            record.total_price = currentprice

class partners_meal_items(models.Model):
    _name = 'partners.meals.item'
    _description = 'partners meals item'
    product_id = fields.Many2one('product.template', string='عنصر الوجبة')
    meal_id = fields.Many2one('partners.meals')
    meals_number = fields.Integer('عدد عناصر الوجبة')
    product_price = fields.Float(related='product_id.list_price', string='سعر عنصر الوجبة', readonly=False, store=False)
    calories = fields.Integer(related='product_id.calories', string='عدد السعرات الحرارية')
    weight = fields.Integer(related='product_id.product_weight', string='وزن الوجبة')
    meal_item_price = fields.Float(string='سعر عناصر الوجبات', compute='_calcprice', store=True)

    @api.depends('meals_number', 'product_price')
    def _calcprice(self):
        for record in self:
            record.meal_item_price = record.meals_number * record.product_price
    #calories = fields.Integer(related='product_id.calories', string='عدد السعرات الحرارية')
    #weight = fields.Integer(related='product_id.product_weight', string='وزن الوجبة')
# from odoo import models, fields, api


# class my_meal(models.Model):
#     _name = 'my_meal.my_meal'
#     _description = 'my_meal.my_meal'

#     name = fields.Char()
#     value = fields.Integer()
#     value2 = fields.Float(compute="_value_pc", store=True)
#     description = fields.Text()
#
#     @api.depends('value')
#     def _value_pc(self):
#         for record in self:
#             record.value2 = float(record.value) / 100
