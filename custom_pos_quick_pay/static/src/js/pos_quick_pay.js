odoo.define('custom_pos_quick_pay.ActionpadWidget', function (require) {
    'use strict';

    const { onWillUnmount } = require('@odoo/owl');
    const ActionpadWidget = require('point_of_sale.ActionpadWidget');
    const Registries = require('point_of_sale.Registries');

    const QuickPayActionpadWidget = (ActionpadWidget) =>
        class extends ActionpadWidget {

            setup() {
                super.setup();
                // اختصارات لوحة المفاتيح: F4 نقدي، F6 بنكي، F8 على الحساب
                this._onQuickPayKey = (ev) => {
                    if (this.env.pos.get_order() && this.env.pos.get_order().finalized) return;
                    if (ev.key === 'F4') {
                        ev.preventDefault();
                        this.quickPay('Cash');
                    } else if (ev.key === 'F6') {
                        ev.preventDefault();
                        this.quickPay('Bank');
                    } else if (ev.key === 'F8') {
                        ev.preventDefault();
                        this.quickPay('Customer Account');
                    }
                };
                window.addEventListener('keydown', this._onQuickPayKey);
            }

            onWillUnmount() {
                window.removeEventListener('keydown', this._onQuickPayKey);
            }

            async quickPay(methodName) {
                const order = this.env.pos.get_order();
                if (!order) return;

                // منع تعديل طلب مكتمل
                if (order.finalized) {
                    this.env.pos.add_new_order();
                    return;
                }

                // التحقق من السلة
                if (order.get_orderlines().length === 0) {
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('خطأ'),
                        body: this.env._t('أضف منتجات إلى السلة قبل الدفع.'),
                    });
                    return;
                }

                // طرق الدفع المفعّلة في هذه النقطة البيعية فقط
                const availableMethods = this.env.pos.payment_methods.filter(
                    (m) => this.env.pos.config.payment_method_ids.includes(m.id)
                );

                // قاموس الأسماء البديلة للمطابقة
                const aliases = {
                    'Cash': ['cash', 'نقدي', 'نقد', 'كاش'],
                    'Bank': ['bank', 'بنكي', 'بنك', 'cib', 'cpte', 'carte', 'بطاقة', 'بطاق'],
                    'Customer Account': ['customer account', 'on account', 'حساب', 'ذمم', 'آجل'],
                };

                const searchTerms = aliases[methodName] || [methodName.toLowerCase()];
                const paymentMethod = availableMethods.find((m) => {
                    const name = (m.name || '').toLowerCase();
                    return searchTerms.some(
                        (alias) => name === alias || name.includes(alias)
                    );
                });

                // طريقة الدفع غير موجودة أو غير مفعّلة
                if (!paymentMethod) {
                    const availableNames = availableMethods.map((m) => m.name).join(', ');
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('خطأ'),
                        body: _.str.sprintf(
                            this.env._t('طريقة الدفع "%s" غير مفعّلة!\n\nالطرق المتاحة: %s'),
                            methodName,
                            availableNames || this.env._t('(لا توجد طرق دفع مفعّلة)')
                        ),
                    });
                    return;
                }

                // الدفع على الحساب يتطلب عميلاً محدداً
                if (methodName === 'Customer Account' && !order.get_partner()) {
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('خطأ'),
                        body: this.env._t('يرجى تحديد العميل أولاً للدفع على الحساب!'),
                    });
                    return;
                }

                // إضافة سطر الدفع بكامل المبلغ (بعد إزالة الأسطر السابقة)
                order.get_paymentlines().forEach((line) => order.remove_paymentline(line));
                const paymentLine = order.add_paymentline(paymentMethod);
                paymentLine.set_amount(order.get_total_with_tax());

                if (!order.is_paid()) {
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('خطأ'),
                        body: this.env._t('تعذّر تغطية المبلغ بطريقة الدفع المختارة.'),
                    });
                    return;
                }

                // إتمام الدفع — نفس منطق أودو الرسمي (PaymentScreen._finalizeValidation)
                order.finalized = true;
                order.initialize_validation_date();   // ✅ تنسيق تاريخ صالح للخادم

                // فتح درج النقود عند الدفع النقدي إن كان مفعّلاً
                if (order.is_paid_with_cash()
                    && this.env.pos.config.iface_cashdrawer
                    && this.env.proxy && this.env.proxy.printer) {
                    this.env.proxy.printer.open_cashbox();
                }

                this.env.services.ui.block();
                try {
                    const result = await this.env.pos.push_single_order(order);
                    this.env.pos.db.remove_unpaid_order(order);

                    if (result && result.length) {
                        // ✅ وصل الطلب إلى الخادم: حذف من الذاكرة وفتح طلب جديد مباشرة
                        this.env.pos.removeOrder(order);
                    } else {
                        // ⚠️ لا يوجد اتصال: الطلب بقي في قائمة المزامنة، لا تحذفه
                        this.showNotification(this.env._t(
                            'لا يوجد اتصال — سيُرسل الطلب تلقائياً عند عودة الاتصال'
                        ));
                    }

                    // طلب جديد مباشرة — بدون شاشة إيصال
                    this.env.pos.add_new_order();
                    this.showScreen('ProductScreen');

                } catch (error) {
                    // ❌ فشل فعلي: إرجاع الطلب لحالته وعرض الخطأ الحقيقي
                    console.error('خطأ في الدفع السريع:', error);
                    order.finalized = false;

                    const msg = (error && error.data && error.data.message)
                        || (error && error.message)
                        || this.env._t('تعذّر إتمام الطلب على الخادم.');

                    this.showPopup('ErrorPopup', {
                        title: this.env._t('فشل الدفع'),
                        body: this.env._t('لم يتم الدفع. السبب: ') + '\n' + msg,
                    });
                } finally {
                    this.env.services.ui.unblock();
                }
            }
        };

    Registries.Component.extend(ActionpadWidget, QuickPayActionpadWidget);

    return QuickPayActionpadWidget;
});