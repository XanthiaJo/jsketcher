JSketcher
===========
![JSketcher Logo](./web/img/JSketcher-logo.svg)

JSketcher is a **parametric** 3D CAD modeler written in pure JavaScript.

This is the **Structured Chaos** fork of [xibyte/jsketcher](https://github.com/xibyte/jsketcher), hosted at [jsketcher.misssponto.me.uk](https://jsketcher.misssponto.me.uk/). It serves the 3D CAD app at `/`; the old standalone `sketcher.html` 2D entry has been removed from this fork.

The public pages use the shared Structured Chaos chrome (`css/shared.css`, `global-bar.js`, `site-header.js`). See [AGENTS.md](./AGENTS.md) and [docs/maintainer-notes.md](./docs/maintainer-notes.md) for fork-specific conventions and the runtime shape.

* [Workbench Dev Guide](./docs/index.md)
* [Architecture Overview](./docs/architecture.md)
* [Maintainer Notes](./docs/maintainer-notes.md)
* [Code Style](./docs/code-style.md)
* [Roadmap](./docs/roadmap.md)
* [Changelog](./docs/changelog.md)

Current Status
==============

JSketcher is a parametric 3d modeler employing a 2D constraint solver for sketches and the feature/history metaphor to build models. The 2D constraint solver is completely written in javascript/typescript and is used inside the 3D CAD workflow. Originally developed by xibyte to make models for 3d printing. Today JSketcher provides a rich set of tools for visualizing, selecting/interacting with 3D geometry, tracking and storing model history all built on the foundation of the sketch constraint engine and employing OpenCascade for solid modeling operations. 

Major Components and features
==============
* Geometric Constraint Solver. This is a most crucial component which allows to solve a system of geometric constraints applied to a sketch. 
  See below the list of supported constraints.
* Sketch constraint tools for designing 2d profiles inside the 3D CAD workflow.      
* 3D Boolean engine. OpenCascade is used to perform booleans on BREP objects.
* Feature History. Accumulates features builds a 3d model step by step. A compare step is employed to propagate edge/face IDs forward to provide a stable and robust model. 
* Export to **STL**, **DWG** and **SVG** formats
* Saving projects in the browser locale storage
* Repository of dimensions. For example if there is a line length constraint applied, it's not necessary to hardcode some length value. 
  A dimension with a symbolic name can be created and the constraint can refer to that dimension by name. 
  Once value of dimension gets changed the sketch is resolved again accordingly to the new dimension values.  
* 2D measurement tool. Allows adding dimensions on a 2D drawing(Linear, Vertical, Horizontal and Arc/Circle dimension are supported)
* No any server-side needed. Only client side Javascript and wasm. 

This modeler is already used for:

* Designing of 3d models to get them 3d-printed. 3D models are based on parametric 2d sketches. All models can be exported as an STL file and 3d-printed after.     
* Creating of 2d parametric sketches which could be exported to DWG or SVG format.   

Supported Constraints
=====================

* Coincident
* Vertical
* Horizontal
* Parallel
* Perpendicular
* Point to Line Distance
* Point to Object Distance
* Entity Equality(radius/length)
* Tangent
* Radius
* Point On Line
* Point On Arc / Ellipse
* Point In Middle
* Angle
* Symmetry
* Lock Convexity
* Fillet Meta Constraint

Get Started With the Code
=========================

Install node.js

* $ cd \<jsketcher folder\>
* $ npm install
* $ npm start

Local development runs on `http://localhost:3001`.

Production is static output from `dist/`, produced by `npm run build` (Grunt). In CloudPanel, create a static site and point the document root at `dist`; do not create a Node app for this frontend.

Contributing
=========================
TBC
