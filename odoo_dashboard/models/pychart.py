# -*- coding: utf-8 -*-


from odoo import fields, models


class PyChart(models.Model):
    _name = 'pychart'

    name = fields.Char(string="Nome", size=50)
    code = fields.Char(string="Código", size=5000)
