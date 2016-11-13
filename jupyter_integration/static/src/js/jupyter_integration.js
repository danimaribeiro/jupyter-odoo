openerp.jupyter_integration = function(instance, local) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    //instance.web.views.add('notebook', 'instance.jupyter_integration.NotebookView');

    local.HomePage = instance.Widget.extend({
        className: 'oe_jupyter_integration',
        start: function() {
            this.$el.append('<iframe style="width:100%;height:100%;border:none;position:absolute;" src="http://localhost:8888/notebooks/Notebook/odoo-curva-abc-clientes.ipynb?dashboard" />')
        },
    });

    instance.web.client_actions.add(
        'jupyter_integration.homepage', 'instance.jupyter_integration.HomePage');

    // instance.jupyter_integration.DummyView = instance.web.View.extend({
    //     template: "DummyView",
    //     display_name: _lt('dummyview'),
    //     default_nr_columns: 3,
    //     view_type: "dummyview",
    //     searchable: false,
    // });
}
