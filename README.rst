=====
qoogr
=====

**/kju-ɡɚ/**

`github.com/sprin/qoogr`_

.. _github.com/sprin/qoogr: https://github.com/sprin/qoogr

**qoogr** is a modular library for dynamically loading graphs and abstracting
graph control widgets and data providers from the graphs themselves. In short,
it is a container for your user-configurable `D3`_ or `three.js`_
visualizations.

.. _D3: http://d3js.org/

.. _three.js: http://threejs.org/

qoogr Principles
================

**qoogr** is set of extensible JavaScript components that can be composed to
build all variety of graph applications. It is a good match for single-page
applications that seek to have highly user-configurable graphs where all
content is generated in the browser. Data providers may be in-browser or
server-side.

**qoogr** apps are built by incorporating the desired components as git
submodules and using them as-is, or subclassing for customization. **qoogr**
is **not** a monolithic framework, but instead allows you to take only
the code you need to keep the project payload small and add/update components
independently. The **qoogr** core is very small and represents the minimum
components needed to build an app. `qoogr-demo`_ shows off the simplest possible
complete **qoogr** app. It is up to you to build the modules in to a
package for production distribution, but the `RequireJS`_ optimizer and
`UglifyJS`_ are recommended.

.. _qoogr-demo: https://github.com/sprin/qoogr-demo

.. _UglifyJS: https://github.com/mishoo/UglifyJS

**qoogr** components are typically subclasses of `Backbone`_ View, which is a
well-known and extensible pattern for representing any code that maps to a
DOM element. Data models are implemented as `Backbone`_ Models and Collections.

.. _Backbone: http://backbonejs.org/

As Backbone requires an external library for DOM manipulation, either `jQuery`_
or `Zepto`_ can be used. Components are designed to work with either.

.. _jQuery: http://jquery.com/

.. _Zepto: http://zeptojs.com/


All components are designed with the AMD module pattern, and the
`RequireJS`_ module loader is used as the default loader.

.. _RequireJS: http://requirejs.org/

To enable a single-page application structure, `Backbone`_ will be used to
implement a Model-View-Presenter pattern. This pattern decouples the data model
(Models and Collections) from presentation (HTML, CSS, SVG). The HTML
presentation is handled by the `Handlebars`_ templating library.  The presenter,
which transforms the data into the presentation and responds to input events,
is actually referred to as a `Backbone`_ View. There is a fourth element:
Controllers, which are responsible for initializing the data models,
coordinating across Views, managing module loading, and doing any pure data
manipulation.  Unlike Views, Controllers have no presentation or
input-handling. And finally, there is a Router role that `Backbone`_ provides to
deliver linkable, shareable URLs, despite the fact that there really is only
one "page". The Router simply changes the URL when a new view is loaded, and
loads the appropriate view when that URL is used as a link or bookmark.

A note: In this context, "view", when not capitalized, refers to what is called
a "page" in traditional web applications. In other words, loading a new view
describes when the content changes significantly, for example, displaying a
new graph.  This is different from the code construct of a `Backbone`_ View,
which is always capitalized.

Graphing
========

`D3`_ is the library used to implement most **qoogr** Graph components; however,
`three.js`_, `Raphael`_, and even HTML templating libraries such as
`Handlebars`_ can be used to implement graphs and other figures. The graphs
themselves will be subclassed from **qoogr** Graph Views that have two outward
facing interfaces: an `initialize` method, and a `update` method.  The
initialization will provide the Graph with an element to draw itself into and a
reference to the data provider. The `update` method is to be called by the
Controller when an event happens that should cause the graph to update based on
new or changed data.  Graphs can also update themselves in response to user
inputs, such as a touchpad or scrollwheel input to zoom a graph.

.. _Raphael: http://raphaeljs.com/

.. _Handlebars: http://handlebarsjs.com/

Graph teardown is handled by an optional `teardown` method. This can be
used to deallocate resources or smoothly transition out of the view.

Graph Controls
==============

The graph controls will be built with subclasses of a **qoogr** graph control
class.  Only a small amount of configuration is required to realize a
customized graph control. In the case of a list of selectable choices (checkbox
list), only the list of options needs to be specified. The graph control will
then communicate to the **qoogr** Query Tree object the part of the query it
represents. The controls may represent filters, changes to the displayed
attributes, and any other user-configurable modification to the query
or graph display.

Each Graph Control is backed by a either a `Backbone`_ Model or Collection,
depending on if the control can represent a single value or set of values.
These data models can be serialized as a JSON objects and persisted with
`HTML5 Local Storage`_.

.. _HTML5 Local Storage: http://diveintohtml5.info/storage.html

Controls are grouped into ControlSets. What defines a ControlSet is the
common graph element target.  For example, we may have two checkbox list
controls that map to different attributes to be filtered on, but map to the
same line within a linechart. You may have multiple ControlSets that map to
different elements within a single graph or different graphs entirely.

Query Mapper, Query Tree, Query Executor
========================================

`qoogr`_ depends on `quijibo`_ for query representation and execution. The
two component types of `quijibo`_ that provide this are the Query Tree and
Query Executor.

The Query Tree object is a representation of a query as a JSON object.
The Query Tree format is specified by the `quijibo`_ project, and can
represent a wide range of queries on a single tabular dataset (table, or array).
The Query Tree format provides query constructs that are commonly performed
on the client-side: filters, aggregation, column selections, limits, and
ordering. Minus joins and subselects, it can be considered a mirror of "basic"
SQL.

The Query Mapper creates and updates the Query Tree when the controls are
changed. Each control is mapped to a sub-tree in the Query Tree, which may
correspond to a filter subclause, or an aggregration/grouping.

The Query Executor then performs the query represented by the Query Tree and
returns with an array that can be consumed directly by `D3`_. There are
many possible implementation of the Query Executor - the simplest being
one which operates on JavaScript Arrays, published as `qjb-qexec-array`_.
Query Executors are not limited to querying in-browser datasets, and can be
used to load data from remote data sources as well, such as relational
databases using `qjb-qexec-sqlalchemy`_. Utilizing the in-browser `IndexedDB`_
persistent storage is also possible - the Query Tree is an abstract
representation of a query, therefore the Query Executor that can have different
realizations.

.. _quijibo: https://github.com/sprin/quijibo

.. _qjb-qexec-array: https://github.com/sprin/qjb-qexec-array

.. _qjb-qexec-sqlalchemy: https://github.com/sprin/qjb-qexec-sqlalchemy

.. _IndexedDB: https://developer.mozilla.org/en-US/docs/IndexedDB/Basic_Concepts_Behind_IndexedDB

Graph Selector
==============

The Graph Selector is a `Backbone`_ View bound to a list of graphs. A typical
presentation would be as an ordered list. It relays an event to the graph
Controller when a new graph is selected from the list.

Graph Controller
================

Graph Controllers will subclass from a **qoogr** Controller class, and will
be responsible for initializing the Models and Collections for data, Graphs,
Graph Controls, Query Tree, and Query Executor. It will also load graphs
on-demand and switch between them. Controllers coordinate the different
objects, and provides the messaging channels between them, allowing the
individual components to be loosely coupled. This enables any Graph Control to
work with any Graph. It also allows for Controllers to act on more than one
Graph or ControlSet as part of the same view.

Other Figures, Such as Tables
=============================

Controllable non-graph figures, such as tables, are possible with the same
**qoogr** Graph class. A conforming `initialize` and `update` method are the
only requirements. `Handlebars`_ is a dependency of **qoogr** core and is
included.

Dataset Exporter
================

The dataset used by a graph can be made available as a download via a `data
URI`_, which allows JavaScript to make data available for download as if it
were an external resource. The Dataset Exporter class retrieves the filtered
and transformed data from the Query Executor, serializes it, and builds the
data URI. A Dataset Exporter can also be configured to export the full dataset.

.. _Data URI: http://en.wikipedia.org/wiki/Data_URI_scheme

