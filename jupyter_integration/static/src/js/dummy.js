openerp.jupyter_integration = function(instance, local) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    instance.web.views.add('notebook', 'instance.jupyter_integration.NotebookView');

instance.jupyter_integration.DummyView = instance.web.View.extend({
    template: "DummyView",
    display_name: _lt('dummyview'),
    default_nr_columns: 3,
    view_type: "dummyview",
    searchable: false,

    init: function (parent, dataset, view_id, options) {
    this._super(parent, dataset, view_id, options);
    var self = this;
    this.fields_view = {};
    this.fields_keys = [];
    this.qweb = new QWeb2.Engine();
    this.qweb.debug = instance.session.debug;
    this.qweb.default_dict = _.clone(QWeb.default_dict);
    this.has_been_loaded = $.Deferred();
    this.currently_dragging = {};
    this.limit = options.limit || 40;
    this.add_group_mutex = new $.Mutex();
},
view_loading: function(r) {
    return this.load_dummyview(r);
},
load_dummyview: function(data) {
    this.fields_view = data;

    // use default order if defined in xml description
    var default_order = this.fields_view.arch.attrs.default_order,
        unsorted = !this.dataset._sort.length;
    if (unsorted && default_order) {
        this.dataset.set_sort(default_order.split(','));
    }

    this.$el.addClass(this.fields_view.arch.attrs['class']);
    this.$buttons = $(QWeb.render("DummyView.buttons", {'widget': this}));
    this.$cont = data.arch.children;

    if (this.options.$buttons) {
        this.$buttons.appendTo(this.options.$buttons);
    } else {
        this.$el.find('.oe_dummyview_buttons').replaceWith(this.$buttons);
    }
    this.$el.find('.oe_dummyview_content').append(this.$cont);
    this.$groups = this.$el.find('.oe_dummyview_groups tr');
    this.fields_keys = _.keys(this.fields_view.fields);
    this.add_qweb_template();

    this.$cont=this.qweb.render('dummy-content', this.qweb_context);
    this.$el.find('.oe_dummyview_content').replaceWith(this.$cont);


    this.has_been_loaded.resolve();
    this.trigger('dummyview_view_loaded', data);
    return $.when();
},
/*  add_qweb_template
*   select the nodes into the xml
*/
add_qweb_template: function() {
    for (var i=0, ii=this.fields_view.arch.children.length; i < ii; i++) {
        var child = this.fields_view.arch.children[i];
        if (child.tag === "templates") {
            this.transform_qweb_template(child);
            this.qweb.add_template(instance.web.json_node_to_xml(child));
            break;
        }
    }
},
transform_qweb_template: function(node) {
    var qweb_add_if = function(node, condition) {
        if (node.attrs[QWeb.prefix + '-if']) {
            condition = _.str.sprintf("(%s) and (%s)", node.attrs[QWeb.prefix + '-if'], condition);
        }
        node.attrs[QWeb.prefix + '-if'] = condition;
    };
    // Process modifiers
    if (node.tag && node.attrs.modifiers) {
        var modifiers = JSON.parse(node.attrs.modifiers || '{}');
        if (modifiers.invisible) {
            qweb_add_if(node, _.str.sprintf("!dummyview_compute_domain(%s)", JSON.stringify(modifiers.invisible)));
        }
    }
    switch (node.tag) {
        case 'field':
            var ftype = this.fields_view.fields[node.attrs.name].type;
            ftype = node.attrs.widget ? node.attrs.widget : ftype;
            if (ftype === 'many2many') {
                if (_.indexOf(this.many2manys, node.attrs.name) < 0) {
                    this.many2manys.push(node.attrs.name);
                }
                node.tag = 'div';
                node.attrs['class'] = (node.attrs['class'] || '') + ' oe_form_field oe_tags';
            } else if (instance.web_dummy.fields_registry.contains(ftype)) {
                // do nothing, the dummyview record will handle it
            } else {
                node.tag = QWeb.prefix;
                node.attrs[QWeb.prefix + '-esc'] = 'record.' + node.attrs['name'] + '.value';
            }
            break;
        case 'button':
        case 'a':
            var type = node.attrs.type || '';
            if (_.indexOf('action,object,edit,open,delete'.split(','), type) !== -1) {
                _.each(node.attrs, function(v, k) {
                    if (_.indexOf('icon,type,name,args,string,context,states,dummyview_states'.split(','), k) != -1) {
                        node.attrs['data-' + k] = v;
                        delete(node.attrs[k]);
                    }
                });
                if (node.attrs['data-string']) {
                    node.attrs.title = node.attrs['data-string'];
                }
                if (node.attrs['data-icon']) {
                    node.children = [{
                        tag: 'img',
                        attrs: {
                            src: instance.session.prefix + '/web/static/src/img/icons/' + node.attrs['data-icon'] + '.png',
                            width: '16',
                            height: '16'
                        }
                    }];
                }
                if (node.tag == 'a') {
                    node.attrs.href = '#';
                } else {
                    node.attrs.type = 'button';
                }
                node.attrs['class'] = (node.attrs['class'] || '') + ' oe_dummyview_action oe_dummyview_action_' + node.tag;
            }
            break;
    }
    if (node.children) {
        for (var i = 0, ii = node.children.length; i < ii; i++) {
            this.transform_qweb_template(node.children[i]);
        }
    }
},
});


function get_class(name) {
return new instance.web.Registry({'tmp' : name}).get_object("tmp");
}

instance.jupyter_integration.fields_registry = new instance.web.Registry({});
};
