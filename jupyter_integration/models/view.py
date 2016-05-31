# -*- coding: utf-8 -*-

from openerp import models


class View(models.Model):
    _inherit = ['ir.ui.view']

    def __init__(self, pool, cr):
        super(View, self).__init__(pool, cr)
        super(View, self)._columns['type'].selection.append(
            ('notebook', 'Notebook'))


class dummy(models.Model):
    _name = 'demo_dummy.content'
    _description = 'Dummy content'
