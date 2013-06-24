define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'handlebars',
    'text!tmpl/selector.html',
    'text!tmpl/controls.html',
  ],
  function(require, $, _, Backbone, Handlebars, selector_tmpl, controls_tmpl) {

  var Controller = Backbone.View.extend({

    el: $('qoogr-box'),

    initialize: function(options) {
      _.bindAll(this, 'load_graph', 'update_graph')
      this.sel_class = this.options.selector_class || SelectorView;
      this.controls_class = this.options.selector_class || ControlsView;

      this.sel = new this.sel_class();
      this.sel.on('load_graph', this.load_graph);

      this.global_q = new Backbone.Model({w: {}});
      this.global_q.on('change', this.update_graph);

      this.controls = new this.controls_class({
        global_q: this.global_q,
      });
    },

    load_graph: function(graph) {

      var t = this;
      //Resize graph area to fit viewport.
      this.$('#qoogr-graph').css({
        width: $(window).width() - 30,
        height: $(window).height() - 30,
      });

      require([graph], function(graph) {
        t.$('svg').remove();
        t.graph = new graph({
          el: t.$('#graph')[0],
          global_q: t.global_q
        });
      });
    },

    update_graph: function() {
      this.graph.update();
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
      this.global_q = this.options.global_q;
      this.render();
      // Set up individual filter widgets here.
    },

    render: function() {
      console.log('rendering graphcontrolsview');
      this.$el.html( this.$tmpl );
    }

  });

  // Return exports.
  return {
    Controller: Controller,
    SelectorView: SelectorView,
    ControlsView: ControlsView,
  };

});

