odoo.define('x_test.main', function(){
    var core = require('web.core');
    var View = require('web.View');
    var _lt = core._lt;

    var chartView = View.extend({
        icon: 'fa-cogs',
        display_name: _lt('PyChart'),
    });
    core.view_registry.add("myview", chartView);
});
