{
    'name': 'Custom POS Quick Pay',
    'version': '16.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'إضافة أزرار دفع سريعة',
    'depends': ['point_of_sale'],
    'data': [],
    'assets': {
        'point_of_sale.assets': [
            'custom_pos_quick_pay/static/src/js/pos_quick_pay.js',
            'custom_pos_quick_pay/static/src/xml/pos_quick_pay.xml',
        ],
    },
    'license': 'LGPL-3',
    'installable': True,
    'application': False,
}