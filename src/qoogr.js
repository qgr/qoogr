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
      t.qexec = t.options.qexec;

      t.sel = new t.sel_class();
      t.sel.on('load_graph', t.load_graph);
    },

    load_graph: function(graph) {

      var t = this;

      // Resize graph area to fit viewport.
      t.$('#qoogr-graph').css({
        width: $(window).width() - 30,
        height: $(window).height() - 30,
      });

      // Set the graph config to that of newly-selected graph.
      t.graph_config = t.graph_config_map[graph];

      // Dynamically load the new graph module, if not yet loaded.
      require([t.graph_config.graph], function(graph) {

        // Teardown old graph.
        t.teardown_graph();


        // Get the Query Mapper and ControlsView from the graph config.
        t.qmapper_class = t.graph_config.qmapper || QueryMapper;
        t.controls_class = t.graph_config.controls || ControlsView;

        // Initialize new Query Mapper and ControlsView
        t.controls = new t.controls_class({
          container: t.$('#qoogr-controls')
        });

        t.qmapper = new t.qmapper_class({
          controls: t.controls
        });

        t.qmapper.on('change', t.update_graph);

        var raw_data = t.get_raw_data();

        t.graph = new graph({
          container: t.$('#qoogr-graph')[0],
          graph_config: t.graph_config,
          raw_data: raw_data
        });
      });
    },

    teardown_graph: function() {
      if (this.controls) {
        this.controls.remove();
      }
      if (this.graph) {
        this.graph.remove();
      }
    },

    update_graph: function() {
      this.graph.update(this.get_raw_data());
    },

    get_raw_data: function() {
      var t = this;
      var qtree = t.qmapper.qtree;
      qtree.select.from = t.graph_config.from;

      return t.qexec.execute_query(
        t.array_map,
        t.qmapper.qtree
      );
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

    $tmpl: $(Handlebars.compile(controls_tmpl)()),

    initialize: function(options) {
      this.container = this.options.container;
      this.render();
      // Set up individual filter widgets here.

    },

    render: function() {
      console.log('rendering graphcontrolsview');
      this.$el.html( this.$tmpl );
      this.container.append(this.$el);
    }

  });

  var QueryMapper = Controller.extend({

    initialize: function(options) {
      _.bindAll(this, 'map_controls');
      this.controls = options.controls;
      this.controls.on('change', this.map_controls);
      this.map_controls();
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

