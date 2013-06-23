require.config({
    baseUrl: "static/src/",
    paths: {
      'text': '../vendor/require/text',
      'json': '../vendor/require/json',
      'underscore': '../vendor/underscore/underscore',
      'zepto': '../vendor/zepto/zepto',
      'zepto_fx': '../vendor/zepto/fx_methods',
      'handlebars': '../vendor/handlebars/handlebars',
      'backbone': '../vendor/backbone/backbone',
      'd3': '../vendor/d3/d3.v3',
      'topojson': '../vendor/topojson/topojson'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'zepto': {
          exports: '$'
        },
        'zepto_fx': {
          deps: ['zepto'],
        },
        'handlebars': {
          exports: 'Handlebars'
        },
        'backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        },
        'd3': {
          exports: 'd3'
        },
        'topojson': {
          exports: 'topojson'
        }
    }
});

requirejs([
    'require',
    'zepto',
    'backbone',
    'handlebars',
    'text!tmpl/selector.html',
    'text!tmpl/controls.html',
  ],
  function(require, $, Backbone, Handlebars, selector_tmpl, controls_tmpl) {

  var QoogrController = Backbone.View.extend({

    el: $('qoogr-box'),

    initialize: function() {
      _.bindAll(this, 'load_graph', 'update_graph')
      this.sel = new GraphSelectorView();
      this.sel.on('load_graph', this.load_graph);
      this.global_q = new Backbone.Model({w: {}});
      this.global_q.on('change', this.update_graph);
      this.controls = new GraphControlsView({
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

  var GraphSelectorView = Backbone.View.extend({

    el: $('#qoogr-selector'),

    events: {
      'click li': 'load_view',
    },

    $tmpl: $(Handlebars.compile(nav_tmpl)()),

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


  var GraphControlsView = Backbone.View.extend({

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

  window.qoogr_con = new QoogrController();

});

