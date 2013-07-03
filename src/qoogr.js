// Qoogr Core

define(function (require) {
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Handlebars = require('handlebars');
  var selector_tmpl = require('text!tmpl/selector.html');
  var controls_tmpl = require('text!tmpl/controls.html');

  // A Controller is really just a generic base class.
  var Controller = function(options) {
    this.initialize.apply(this, arguments);
  }

  // Extend Controller with Backbone Events
  _.extend(Controller.prototype, Backbone.Events, {

    // Default initialize is a no-op.
    initialize: function(){},

  });

  // Function to proxy an event on one object to another.
  var proxy = function(object, event) {
    var t = this;
    object.on(event, function() {
      t.trigger(event);
    });
  }

  // Give Controllers and Views proxy.
  Controller.prototype.proxy = Backbone.View.prototype.proxy = proxy;


  // Makes Controllers extendable like all other Backbone classes.
  Controller.extend = Backbone.View.extend;

  var QoogrView = Backbone.View.extend({

    el: $('#qoogr-box'),

    initialize: function(options) {
      var t = this;
      _.bindAll(t, 'load_graph', 'update_graph');
      t.array_map = t.options.array_map;
      t.graph_config_map = t.options.graph_config_map;
      t.sel_class = t.options.selector_class || SelectorView;
      t.qmapper_class = t.options.qmapper_class || QueryMapper;
      t.qexec = t.options.qexec;
      t.controls_class = t.options.controls_class || ControlsView;

      t.sel = new t.sel_class();
      t.sel.on('load_graph', t.load_graph);

      t.controls = new t.controls_class();

      t.qmapper = new t.qmapper_class({
        controls: t.controls
      });

      t.qmapper.on('change', t.update_graph);
    },

    load_graph: function(graph) {

      var t = this;

      // Set the graph config to that of newly-selected graph.
      t.graph_config = t.graph_config_map[graph];

      // Resize graph area to fit viewport.
      t.$('#qoogr-graph').css({
        width: $(window).width() - 30,
        height: $(window).height() - 30,
      });

      // TODO: Apply initial filters, if any.
      var raw_data = t.array_map[t.graph_config.from];

      // Dynamically load the new graph module, if not yet loaded.
      require([t.graph_config.graph], function(graph) {
        t.$('svg').remove();
        t.graph = new graph({
          el: t.$('#qoogr-graph')[0],
          graph_config: t.graph_config,
          raw_data: raw_data
        });
      });
    },

    update_graph: function() {
      var t = this;
      var qtree = t.qmapper.qtree;
      qtree.select.from = t.graph_config.from;

      var raw_data = t.qexec.execute_query(
        t.array_map,
        t.qmapper.qtree
      );
      console.log(raw_data)
      this.graph.update(raw_data);
    }

  });

  var SelectorView = Backbone.View.extend({

    el: $('#qoogr-selector'),

    events: {
      'click li': 'load_view',
    },

    $tmpl: $(Handlebars.compile(selector_tmpl)()),

    initialize: function() {
      this.render();
    },

    render: function() {
      console.log('rendering graphselectorview');
      this.$el.html( this.$tmpl );
    },

    load_view: function(e) {
      e.stopImmediatePropagation();
      // Get the view associated with the li by the data attr.
      graph = e.currentTarget.dataset.graph;

      // The selector should not handle graph loading... leave it up to the
      // listening controller to handle it by triggering an event.
      this.trigger('load_graph', graph);
    }

  });


  var ControlsView = Backbone.View.extend({

    el: '#qoogr-controls',

    $tmpl: $(Handlebars.compile(controls_tmpl)()),

    initialize: function(options) {
      this.render();
      // Set up individual filter widgets here.

    },

    render: function() {
      console.log('rendering graphcontrolsview');
      this.$el.html( this.$tmpl );
    }

  });

  var QueryMapper = Controller.extend({

    initialize: function(options) {
      _.bindAll(this, 'map_controls');
      this.controls = options.controls;
      this.controls.on('change', this.map_controls)
    },

    map_controls: function() {
      var t = this;
      // Build a new qtree by reading each control's data model.
      // The following is a stub for a basic filter qtree.
      t.qtree = {
        select: {
          where: {
            and: []
          }
        }
      }
      // Alias the toplevel and subclause for brevity.
      var and = t.qtree.select.where.and;

      // Push subclauses from control data models into query tree.
      // and.push(t.controls.my_collection.get_subtree());

      // Fire change event to alert listeners qtree has changed.
      t.trigger('change');
    }

  });

  // Return exports.
  return {
    Controller: Controller,
    QoogrView: QoogrView,
    SelectorView: SelectorView,
    ControlsView: ControlsView,
    QueryMapper: QueryMapper,
  };

});

