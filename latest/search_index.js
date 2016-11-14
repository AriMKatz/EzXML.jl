var documenterSearchIndex = {"docs": [

{
    "location": "index.html#",
    "page": "Home",
    "title": "Home",
    "category": "page",
    "text": ""
},

{
    "location": "index.html#Home-1",
    "page": "Home",
    "title": "Home",
    "category": "section",
    "text": "EzXML.jl is a package for handling XML and HTML documents. The APIs are simple and consistent, and provide a range of functionalities including:Traversing XML/HTML documents with DOM-like interfaces.\nProperly handling XML namespaces.\nSearching elements using XPath.\nParsing large files with streaming APIs.\nAutomatic memory management.Here is an example of parsing and traversing an XML document:using EzXML\n\n# Parse an XML string\n# (use `read(Document, <filename>)` to read a document from a file).\ndoc = parse(Document, \"\"\"\n<primates>\n    <genus name=\"Homo\">\n        <species name=\"sapiens\">Human</species>\n    </genus>\n    <genus name=\"Pan\">\n        <species name=\"paniscus\">Bonobo</species>\n        <species name=\"troglodytes\">Chimpanzee</species>\n    </genus>\n</primates>\n\"\"\")\n\n# Get the root element from `doc`.\nprimates = root(doc)\n\n# Iterate over child elements.\nfor genus in eachelement(primates)\n    # Get an attribute value by name.\n    genus_name = genus[\"name\"]\n    println(\"- \", genus_name)\n    for species in eachelement(genus)\n        # Get the content within an element.\n        species_name = content(species)\n        println(\"  └ \", species[\"name\"], \" (\", species_name, \")\")\n    end\nend\nprintln()\n\n# Find texts using XPath query.\nfor species_name in content.(find(primates, \"//species/text()\"))\n    println(\"- \", species_name)\nendIf you are new to this package, read the manual page first. It provides a general guide to the package. The references page offers a full documentation for each function and the developer notes page explains about the internal design for developers."
},

{
    "location": "manual.html#",
    "page": "Manual",
    "title": "Manual",
    "category": "page",
    "text": ""
},

{
    "location": "manual.html#Manual-1",
    "page": "Manual",
    "title": "Manual",
    "category": "section",
    "text": "This page is dedicated to those who are new to EzXML.jl. It is recommended to read this page before reading other pages to grasp the concepts of the package first. Once you have read it, the references page would be a better place to find necessary functions. The developer notes page is for developers and most users do not need to read it."
},

{
    "location": "manual.html#Data-types-1",
    "page": "Manual",
    "title": "Data types",
    "category": "section",
    "text": "There are two types that constitute an XML document and components: Document and Node, respectively. The Document type represents a whole XML document and points to a document node of Node type. The Node type represents almost everything in an XML document, that is, elements, attributes, texts, CDATAs, comments, documents, etc. are all Node type objects.Several kinds of constructors are provided to create documents and various node types. For example, XMLDocument creates an XML document, ElementNode does an element node, and TextNode does a text node:julia> using EzXML\n\njulia> doc = XMLDocument()\nEzXML.Document(EzXML.Node(<DOCUMENT_NODE@0x00007fa2ec190b70>))\n\njulia> typeof(doc)\nEzXML.Document\n\njulia> print(doc)\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\njulia> elm = ElementNode(\"elm\")\nEzXML.Node(<ELEMENT_NODE@0x00007fcd5bd42920>)\n\njulia> typeof(elm)\nEzXML.Node\n\njulia> println(elm)\n<elm/>\n\njulia> txt = TextNode(\"some text\")\nEzXML.Node(<TEXT_NODE@0x00007fcd5be9aaf0>)\n\njulia> typeof(txt)\nEzXML.Node\n\njulia> println(txt)\nsome text\nCalling the show method of Node shows a node type and a pointer address to a node struct of libxml2 within the angle brackets so that you can quickly check the type of a node and its identity. The print method of Node shows an XML tree rooted at the node. prettyprint is also provided to print formatted XML."
},

{
    "location": "manual.html#DOM-interfaces-1",
    "page": "Manual",
    "title": "DOM interfaces",
    "category": "section",
    "text": "DOM interfaces regard an XML document as a tree of nodes. There is a root node at the top of a document tree and each node has zero or more child nodes. Some nodes (e.g. texts, attributes, etc.) cannot have child nodes.For the demonstration purpose, save the next XML in \"primates.xml\" file.<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<primates>\n    <genus name=\"Homo\">\n        <species name=\"sapiens\">Human</species>\n    </genus>\n    <genus name=\"Pan\">\n        <species name=\"paniscus\">Bonobo</species>\n        <species name=\"troglodytes\">Chimpanzee</species>\n    </genus>\n</primates>read(Document, <filename>) reads an XML file and builds a document object in memory.  On the other hand parse(Document, <string or byte array>) parses an XML string or a byte array and builds a document object like the read method:julia> doc = read(Document, \"primates.xml\")\nEzXML.Document(EzXML.Node(<DOCUMENT_NODE@0x00007fff3cfe8a50>))\n\njulia> data = readstring(\"primates.xml\");\n\njulia> doc = parse(Document, data)\nEzXML.Document(EzXML.Node(<DOCUMENT_NODE@0x00007fff3d161380>))\nBefore traversing the document we need to retrieve the root of the document tree.  root(<document>) returns the root element of a document and we can start traversal there:julia> primates = root(doc)  # Get the root element.\nEzXML.Node(<ELEMENT_NODE@0x00007fff3d109ef0>)\n\njulia> nodetype(primates)    # The node is an element node.\nELEMENT_NODE\n\njulia> name(primates)        # `name` returns the tag name of an element.\n\"primates\"\n\njulia> haselement(primates)  # Check if a node has one or more elements.\ntrue\n\njulia> genus = elements(primates)  # `elements` returns all child elements.\n2-element Array{EzXML.Node,1}:\n EzXML.Node(<ELEMENT_NODE@0x00007fff3cff0000>)\n EzXML.Node(<ELEMENT_NODE@0x00007fff3cfbdf00>)\n\njulia> name.(genus)          # Broadcasting syntax (dot function) works.\n2-element Array{String,1}:\n \"genus\"\n \"genus\"\nAttribute values can be accessed by its name like a dictionary; haskey, getindex, setindex! and delete! are overloaded for element nodes. Qualified name, which may or may not have the prefix of a namespace, can be used as a key name:julia> haskey(genus[1], \"name\")  # Check whether an attribute exists.\ntrue\n\njulia> genus[1][\"name\"]          # Get a value as a string.\n\"Homo\"\n\njulia> genus[2][\"name\"]          # Same above.\n\"Pan\"\n\njulia> println(genus[1])             # Print a \"genus\" element before updating.\n<genus name=\"Homo\">\n        <species name=\"sapiens\">Human</species>\n    </genus>\n\njulia> genus[1][\"taxonID\"] = \"9206\"  # Insert a new attribute.\n\"9206\"\n\njulia> println(genus[1])             # The \"genus\" element has been updated.\n<genus name=\"Homo\" taxonID=\"9206\">\n        <species name=\"sapiens\">Human</species>\n    </genus>\nIn this package, a Node object is regarded as a container of its child nodes. This idea is reflected on function names; for example, a function returning the first child node is named as firstnode instead of firstchildnode. All functions provided by the EzXML module are named in this way and tree traversal functions works on its child nodes by default. Functions with a direction prefix works on that direction; for example, nextnode returns the next sibling node and parentnode returns the parent node.Distinction between nodes and elements is what every user should know about before using DOM APIs.  There are good explanations on this topic: <http://www.w3schools.com/xml/dom_nodes.asp>, <http://stackoverflow.com/questions/132564/whats-the-difference-between-an-element-and-a-node-in-xml>. Some functions have a suffix like node or element that indicates the node type the function is interested in. For example, hasnode(<parent node>) checks if a (parent) node has one or more child nodes while haselement(<parent node>) checks if a (parent) node has one or more child elements. All functions are also named in this way:julia> hasnode(primates)       # `primates` contains child nodes?\ntrue\n\njulia> haselement(primates)    # `primates` contains child elements?\ntrue\n\njulia> firstnode(primates)     # Get the first child node, which is a text node.\nEzXML.Node(<TEXT_NODE@0x00007fff3cfe92f0>)\n\njulia> lastnode(primates)      # Get the last child node, which is a text node, too.\nEzXML.Node(<TEXT_NODE@0x00007fff3cfe4b60>)\n\njulia> firstelement(primates)  # Get the first child element, which is apparently an element node.\nEzXML.Node(<ELEMENT_NODE@0x00007fff3cff0000>)\n\njulia> lastelement(primates)   # Get the last child element, which is apparently an element node, too.\nEzXML.Node(<ELEMENT_NODE@0x00007fff3cfbdf00>)\nIf you'd like to iterate over child nodes or elements, you can use the eachnode(<parent node>) or eachelement(<parent node>) function.  The eachnode function generates all nodes including texts, elements, comments, and so on while eachelement selects element nodes only. nodes(<parent node>) and elements(<parent node>) are handy functions that return a vector of nodes and elements, respectively:julia> for genus in eachnode(primates)\n           @show genus\n       end\ngenus = EzXML.Node(<TEXT_NODE@0x00007fff3cfe92f0>)\ngenus = EzXML.Node(<ELEMENT_NODE@0x00007fff3cff0000>)\ngenus = EzXML.Node(<TEXT_NODE@0x00007fff3d10a090>)\ngenus = EzXML.Node(<ELEMENT_NODE@0x00007fff3cfbdf00>)\ngenus = EzXML.Node(<TEXT_NODE@0x00007fff3cfe4b60>)\n\njulia> for genus in eachelement(primates)\n           @show genus\n       end\ngenus = EzXML.Node(<ELEMENT_NODE@0x00007fff3cff0000>)\ngenus = EzXML.Node(<ELEMENT_NODE@0x00007fff3cfbdf00>)\n\njulia> nodes(primates)\n5-element Array{EzXML.Node,1}:\n EzXML.Node(<TEXT_NODE@0x00007fff3cfe92f0>)\n EzXML.Node(<ELEMENT_NODE@0x00007fff3cff0000>)\n EzXML.Node(<TEXT_NODE@0x00007fff3d10a090>)\n EzXML.Node(<ELEMENT_NODE@0x00007fff3cfbdf00>)\n EzXML.Node(<TEXT_NODE@0x00007fff3cfe4b60>)\n\njulia> elements(primates)\n2-element Array{EzXML.Node,1}:\n EzXML.Node(<ELEMENT_NODE@0x00007fff3cff0000>)\n EzXML.Node(<ELEMENT_NODE@0x00007fff3cfbdf00>)\nThere are so many functions to traverse XML document trees. The complete list of these functions is available at the reference page."
},

{
    "location": "manual.html#Constructing-documents-1",
    "page": "Manual",
    "title": "Constructing documents",
    "category": "section",
    "text": "ExXML.jl also supports constructing XML/HTML documents.The components of an XML document can be created using document/node constructors introduced above:julia> doc = XMLDocument()\nEzXML.Document(EzXML.Node(<DOCUMENT_NODE@0x00007fe4b57bfbc0>))\n\njulia> r = ElementNode(\"root\")\nEzXML.Node(<ELEMENT_NODE@0x00007fe4b581c5a0>)Setting a root element to a document can be done by the setroot!(<document>, <root>) function:julia> setroot!(doc, r)\nEzXML.Document(EzXML.Node(<DOCUMENT_NODE@0x00007fe4b57bfbc0>))\n\njulia> print(doc)\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<root/>\nOther child elements or subtrees can be linked to an existing element using link!(<parent node>, <child node>):julia> c = ElementNode(\"child\")\nEzXML.Node(<ELEMENT_NODE@0x00007fe4b57de820>)\n\njulia> link!(r, c)\nEzXML.Node(<ELEMENT_NODE@0x00007fe4b57de820>)\n\njulia> print(doc)\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<root><child/></root>\n\njulia> setcontent!(c, \"some content\")\nEzXML.Node(<ELEMENT_NODE@0x00007fe4b57de820>)\n\njulia> print(doc)\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<root><child>some content</child></root>\n\njulia> c = ElementNode(\"child\")\nEzXML.Node(<ELEMENT_NODE@0x00007fe4b5841f00>)\n\njulia> link!(r, c)\nEzXML.Node(<ELEMENT_NODE@0x00007fe4b5841f00>)\n\njulia> print(doc)\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<root><child>some content</child><child/></root>\nAfter finished building an XML document, the user can serialize it into a file as follows:julia> write(\"out.xml\", doc)  # Write a document into a file.\n88\n\nshell> cat out.xml\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<root><child>some content</child><child/></root>\n"
},

{
    "location": "manual.html#Streaming-interfaces-1",
    "page": "Manual",
    "title": "Streaming interfaces",
    "category": "section",
    "text": "In addition to DOM interfaces, EzXML.jl provides a streaming reader of XML files. The streaming reader processes, as the name suggests, a stream of an XML data read from a file instead of reading a whole XML tree into the memory. This enables reading extremely large files that do not fit in RAM.Let's use the following XML file (undirected.graphml) that represents an undirected graph formatted in GraphML (slightly simplified for brevity):<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<graphml>\n    <graph edgedefault=\"undirected\">\n        <node id=\"n0\"/>\n        <node id=\"n1\"/>\n        <node id=\"n2\"/>\n        <node id=\"n3\"/>\n        <node id=\"n4\"/>\n        <edge source=\"n0\" target=\"n2\"/>\n        <edge source=\"n1\" target=\"n2\"/>\n        <edge source=\"n2\" target=\"n3\"/>\n        <edge source=\"n3\" target=\"n4\"/>\n    </graph>\n</graphml>The interfaces of streaming reader are totally different from the DOM interfaces introduced above. The first thing the user needs to do is creating an XMLReader object using the open function:julia> reader = open(XMLReader, \"undirected.graphml\")\nEzXML.XMLReader(Ptr{EzXML._TextReader} @0x00007f95fb6c0b00)\nIteration is advanced by the done(<reader>) method, which updates the current reading position of the reader and returns false when there is al least one node to read from the stram:julia> done(reader)  # Read the 1st node.\nfalse\n\njulia> nodetype(reader)\nREADER_ELEMENT\n\njulia> name(reader)\n\"graphml\"\n\njulia> done(reader)  # Read the 2nd node.\nfalse\n\njulia> nodetype(reader)\nREADER_SIGNIFICANT_WHITESPACE\n\njulia> name(reader)\n\"#text\"\n\njulia> done(reader)  # Read the 3rd node.\nfalse\n\njulia> nodetype(reader)\nREADER_ELEMENT\n\njulia> name(reader)\n\"graph\"\n\njulia> reader[\"edgedefault\"]\n\"undirected\"\nUnlike DOM interfaces, methods are applied to a reader object. This is because the streaming reader does not construct a DOM tree while reading and hence we have no access to actual nodes of an XML document. Methods like nodetype, name, content, namespace and getindex are overloaded for the reader type.An important thing to be noted is that while the value of nodetype for the XML reader returns the current node type, the domain is slightly different from that of nodetype for Node, but slightly different meanings. For example, there are two kinds of values that will be returned when reading an element node: READER_ELEMENT and READER_END_ELEMENT. The former indicates the reader just read an opening tag of an element node while the latter does the reader just read an ending tag of an element node.In addition to these functions, there are several functions that are specifict to the streaming reader. The depth(<rreader>) function returns the depth of the current node. The expandtree(<reader>) function expands the current node into a complete subtree rooted at the node. This function is useful when you want to use the DOM interfaces for the node. However, the expanded subtree is alive until the next read of a new node. That means you cannot keep references to (parts of) the expanded subtree.An idiomatic way of stream reading would look like this:reader = open(Document, \"undirected.graphml\")\nwhile !done(reader)\n    typ = nodetype(reader)\n    # body\nend\nclose(reader)Alternatively, EzXML.jl supports for loop, too:reader = open(Document, \"undirected.graphml\")\nfor typ in reader\n    # body\nend\nclose(reader)"
},

{
    "location": "references.html#",
    "page": "References",
    "title": "References",
    "category": "page",
    "text": ""
},

{
    "location": "references.html#References-1",
    "page": "References",
    "title": "References",
    "category": "section",
    "text": ""
},

{
    "location": "references.html#EzXML.Document",
    "page": "References",
    "title": "EzXML.Document",
    "category": "Type",
    "text": "An XML/HTML document type.\n\n\n\n"
},

{
    "location": "references.html#EzXML.Node",
    "page": "References",
    "title": "EzXML.Node",
    "category": "Type",
    "text": "A proxy type to libxml2's node struct.\n\n\n\n"
},

{
    "location": "references.html#EzXML.XMLError",
    "page": "References",
    "title": "EzXML.XMLError",
    "category": "Type",
    "text": "An error detected by libxml2.\n\n\n\n"
},

{
    "location": "references.html#Types-1",
    "page": "References",
    "title": "Types",
    "category": "section",
    "text": "Document\nNode\nXMLError"
},

{
    "location": "references.html#EzXML.parsexml",
    "page": "References",
    "title": "EzXML.parsexml",
    "category": "Function",
    "text": "parsexml(xmlstring)\n\nParse xmlstring and create an XML document.\n\n\n\n"
},

{
    "location": "references.html#EzXML.parsehtml",
    "page": "References",
    "title": "EzXML.parsehtml",
    "category": "Function",
    "text": "parsehtml(htmlstring)\n\nParse htmlstring and create an HTML document.\n\n\n\n"
},

{
    "location": "references.html#EzXML.readxml",
    "page": "References",
    "title": "EzXML.readxml",
    "category": "Function",
    "text": "readxml(filename)\n\nRead filename and create an XML document.\n\n\n\n"
},

{
    "location": "references.html#EzXML.readhtml",
    "page": "References",
    "title": "EzXML.readhtml",
    "category": "Function",
    "text": "readhtml(filename)\n\nRead filename and create an HTML document.\n\n\n\n"
},

{
    "location": "references.html#EzXML.prettyprint",
    "page": "References",
    "title": "EzXML.prettyprint",
    "category": "Function",
    "text": "prettyprint([io], node::Node)\n\nPrint node with formatting.\n\n\n\nprettyprint([io], doc::Document)\n\nPrint doc with formatting.\n\n\n\n"
},

{
    "location": "references.html#I/O-1",
    "page": "References",
    "title": "I/O",
    "category": "section",
    "text": "parsexml\nparsehtml\nreadxml\nreadhtml\nprettyprint"
},

{
    "location": "references.html#EzXML.XMLDocument",
    "page": "References",
    "title": "EzXML.XMLDocument",
    "category": "Function",
    "text": "XMLDocument(version=\"1.0\")\n\nCreate an XML document.\n\n\n\n"
},

{
    "location": "references.html#EzXML.HTMLDocument",
    "page": "References",
    "title": "EzXML.HTMLDocument",
    "category": "Function",
    "text": "HTMLDocument(uri=nothing, externalID=nothing)\n\nCreate an HTML document.\n\n\n\n"
},

{
    "location": "references.html#EzXML.XMLDocumentNode",
    "page": "References",
    "title": "EzXML.XMLDocumentNode",
    "category": "Function",
    "text": "XMLDocumentNode(version)\n\nCreate an XML document node with version.\n\n\n\n"
},

{
    "location": "references.html#EzXML.HTMLDocumentNode",
    "page": "References",
    "title": "EzXML.HTMLDocumentNode",
    "category": "Function",
    "text": "HTMLDocumentNode(uri, externalID)\n\nCreate an HTML document node.\n\nuri and externalID are either a string or nothing.\n\n\n\n"
},

{
    "location": "references.html#EzXML.ElementNode",
    "page": "References",
    "title": "EzXML.ElementNode",
    "category": "Function",
    "text": "ElementNode(name)\n\nCreate an element node with name.\n\n\n\n"
},

{
    "location": "references.html#EzXML.TextNode",
    "page": "References",
    "title": "EzXML.TextNode",
    "category": "Function",
    "text": "TextNode(content)\n\nCreate a text node with content.\n\n\n\n"
},

{
    "location": "references.html#EzXML.CommentNode",
    "page": "References",
    "title": "EzXML.CommentNode",
    "category": "Function",
    "text": "CommentNode(content)\n\nCreate a comment node with content.\n\n\n\n"
},

{
    "location": "references.html#EzXML.CDataNode",
    "page": "References",
    "title": "EzXML.CDataNode",
    "category": "Function",
    "text": "CDataNode(content)\n\nCreate a CDATA node with content.\n\n\n\n"
},

{
    "location": "references.html#EzXML.AttributeNode",
    "page": "References",
    "title": "EzXML.AttributeNode",
    "category": "Function",
    "text": "AttributeNode(name, value)\n\nCreate an attribute node with name and value.\n\n\n\n"
},

{
    "location": "references.html#Constructors-1",
    "page": "References",
    "title": "Constructors",
    "category": "section",
    "text": "XMLDocument\nHTMLDocument\nXMLDocumentNode\nHTMLDocumentNode\nElementNode\nTextNode\nCommentNode\nCDataNode\nAttributeNode"
},

{
    "location": "references.html#Node-types-1",
    "page": "References",
    "title": "Node types",
    "category": "section",
    "text": "Node type Integer\nEzXML.ELEMENT_NODE 1\nEzXML.ATTRIBUTE_NODE 2\nEzXML.TEXT_NODE 3\nEzXML.CDATA_SECTION_NODE 4\nEzXML.ENTITY_REF_NODE 5\nEzXML.ENTITY_NODE 6\nEzXML.PI_NODE 7\nEzXML.COMMENT_NODE 8\nEzXML.DOCUMENT_NODE 9\nEzXML.DOCUMENT_TYPE_NODE 10\nEzXML.DOCUMENT_FRAG_NODE 11\nEzXML.NOTATION_NODE 12\nEzXML.HTML_DOCUMENT_NODE 13\nEzXML.DTD_NODE 14\nEzXML.ELEMENT_DECL 15\nEzXML.ATTRIBUTE_DECL 16\nEzXML.ENTITY_DECL 17\nEzXML.NAMESPACE_DECL 18\nEzXML.XINCLUDE_START 19\nEzXML.XINCLUDE_END 20\nEzXML.DOCB_DOCUMENT_NODE 21"
},

{
    "location": "references.html#EzXML.nodetype-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.nodetype",
    "category": "Method",
    "text": "nodetype(node::Node)\n\nReturn the type of node as an integer.\n\n\n\n"
},

{
    "location": "references.html#EzXML.name-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.name",
    "category": "Method",
    "text": "name(node::Node)\n\nReturn the node name of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.content-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.content",
    "category": "Method",
    "text": "content(node::Node)\n\nReturn the node content of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.namespace-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.namespace",
    "category": "Method",
    "text": "namespace(node::Node)\n\nReturn the namespace associated with node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.namespaces-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.namespaces",
    "category": "Method",
    "text": "namespaces(node::Node)\n\nCreate a vector of namespaces applying to node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.iselement-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.iselement",
    "category": "Method",
    "text": "iselement(node::Node)\n\nReturn if node is an element node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.isattribute-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.isattribute",
    "category": "Method",
    "text": "isattribute(node::Node)\n\nReturn if node is an attribute node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.istext-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.istext",
    "category": "Method",
    "text": "istext(node::Node)\n\nReturn if node is a text node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.iscdata-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.iscdata",
    "category": "Method",
    "text": "iscdata(node::Node)\n\nReturn if node is a CDATA node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.iscomment-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.iscomment",
    "category": "Method",
    "text": "iscomment(node::Node)\n\nReturn if node is a comment node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.countnodes-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.countnodes",
    "category": "Method",
    "text": "countnodes(parent::Node)\n\nCount the number of child nodes of parent.\n\n\n\n"
},

{
    "location": "references.html#EzXML.countelements-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.countelements",
    "category": "Method",
    "text": "countelements(parent::Node)\n\nCount the number of child elements of parent.\n\n\n\n"
},

{
    "location": "references.html#EzXML.countattributes-Tuple{EzXML.Node}",
    "page": "References",
    "title": "EzXML.countattributes",
    "category": "Method",
    "text": "countattributes(elem::Node)\n\nCount the number of attributes of elem.\n\n\n\n"
},

{
    "location": "references.html#Node-accessors-1",
    "page": "References",
    "title": "Node accessors",
    "category": "section",
    "text": "nodetype(::Node)\nname(::Node)\ncontent(::Node)\nnamespace(::Node)\nnamespaces(::Node)\niselement(::Node)\nisattribute(::Node)\nEzXML.istext(::Node)\niscdata(::Node)\niscomment(::Node)\ncountnodes(::Node)\ncountelements(::Node)\ncountattributes(::Node)"
},

{
    "location": "references.html#EzXML.setname!-Tuple{EzXML.Node,AbstractString}",
    "page": "References",
    "title": "EzXML.setname!",
    "category": "Method",
    "text": "setname!(node::Node, name::AbstractString)\n\nSet the name of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.setcontent!-Tuple{EzXML.Node,AbstractString}",
    "page": "References",
    "title": "EzXML.setcontent!",
    "category": "Method",
    "text": "setcontent!(node::Node, content::AbstractString)\n\nReplace the content of node.\n\n\n\n"
},

{
    "location": "references.html#Node-modifiers-1",
    "page": "References",
    "title": "Node modifiers",
    "category": "section",
    "text": "setname!(::Node, ::AbstractString)\nsetcontent!(::Node, ::AbstractString)"
},

{
    "location": "references.html#EzXML.document",
    "page": "References",
    "title": "EzXML.document",
    "category": "Function",
    "text": "document(node::Node)\n\nReturn the document of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.root",
    "page": "References",
    "title": "EzXML.root",
    "category": "Function",
    "text": "root(doc::Document)\n\nReturn the root element of doc.\n\n\n\n"
},

{
    "location": "references.html#EzXML.parentnode",
    "page": "References",
    "title": "EzXML.parentnode",
    "category": "Function",
    "text": "parentnode(node::Node)\n\nReturn the parent of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.firstnode",
    "page": "References",
    "title": "EzXML.firstnode",
    "category": "Function",
    "text": "firstnode(node::Node)\n\nReturn the first child node of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.lastnode",
    "page": "References",
    "title": "EzXML.lastnode",
    "category": "Function",
    "text": "lastnode(node::Node)\n\nReturn the last child node of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.firstelement",
    "page": "References",
    "title": "EzXML.firstelement",
    "category": "Function",
    "text": "firstelement(node::Node)\n\nReturn the first child element of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.lastelement",
    "page": "References",
    "title": "EzXML.lastelement",
    "category": "Function",
    "text": "lastelement(node::Node)\n\nReturn the last child element of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.nextnode",
    "page": "References",
    "title": "EzXML.nextnode",
    "category": "Function",
    "text": "nextnode(node::Node)\n\nReturn the next node of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.prevnode",
    "page": "References",
    "title": "EzXML.prevnode",
    "category": "Function",
    "text": "prevnode(node::Node)\n\nReturn the previous node of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.nextelement",
    "page": "References",
    "title": "EzXML.nextelement",
    "category": "Function",
    "text": "nextelement(node::Node)\n\nReturn the next element of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.prevelement",
    "page": "References",
    "title": "EzXML.prevelement",
    "category": "Function",
    "text": "prevelement(node::Node)\n\nReturn the previous element of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.eachnode",
    "page": "References",
    "title": "EzXML.eachnode",
    "category": "Function",
    "text": "eachnode(node::Node)\n\nCreate an iterator of child nodes.\n\n\n\n"
},

{
    "location": "references.html#EzXML.nodes",
    "page": "References",
    "title": "EzXML.nodes",
    "category": "Function",
    "text": "nodes(node::Node)\n\nCreate a vector of child nodes.\n\n\n\n"
},

{
    "location": "references.html#EzXML.eachelement",
    "page": "References",
    "title": "EzXML.eachelement",
    "category": "Function",
    "text": "eachelement(node::Node)\n\nCreate an iterator of child elements.\n\n\n\n"
},

{
    "location": "references.html#EzXML.elements",
    "page": "References",
    "title": "EzXML.elements",
    "category": "Function",
    "text": "elements(node::Node)\n\nCreate a vector of child elements.\n\n\n\n"
},

{
    "location": "references.html#EzXML.eachattribute",
    "page": "References",
    "title": "EzXML.eachattribute",
    "category": "Function",
    "text": "eachattribute(node::Node)\n\nCreate an iterator of attributes.\n\n\n\n"
},

{
    "location": "references.html#EzXML.attributes",
    "page": "References",
    "title": "EzXML.attributes",
    "category": "Function",
    "text": "attributes(node::Node)\n\nCreate a vector of attributes.\n\n\n\n"
},

{
    "location": "references.html#DOM-tree-accessors-1",
    "page": "References",
    "title": "DOM tree accessors",
    "category": "section",
    "text": "document\nroot\nparentnode\nfirstnode\nlastnode\nfirstelement\nlastelement\nnextnode\nprevnode\nnextelement\nprevelement\neachnode\nnodes\neachelement\nelements\neachattribute\nattributes"
},

{
    "location": "references.html#EzXML.setroot!",
    "page": "References",
    "title": "EzXML.setroot!",
    "category": "Function",
    "text": "setroot!(doc::Document, node::Node)\n\nSet the root element of doc to node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.link!",
    "page": "References",
    "title": "EzXML.link!",
    "category": "Function",
    "text": "link!(parent::Node, child::Node)\n\nLink child at the end of children of parent.\n\n\n\n"
},

{
    "location": "references.html#EzXML.linknext!",
    "page": "References",
    "title": "EzXML.linknext!",
    "category": "Function",
    "text": "linknext!(target::Node, node::Node)\n\nLink node as the next sibling of target.\n\n\n\n"
},

{
    "location": "references.html#EzXML.linkprev!",
    "page": "References",
    "title": "EzXML.linkprev!",
    "category": "Function",
    "text": "linkprev!(target::Node, node::Node)\n\nLink node as the prev sibling of target.\n\n\n\n"
},

{
    "location": "references.html#EzXML.unlink!",
    "page": "References",
    "title": "EzXML.unlink!",
    "category": "Function",
    "text": "unlink!(node::Ndoe)\n\nUnlink node from its context.\n\n\n\n"
},

{
    "location": "references.html#EzXML.addelement!",
    "page": "References",
    "title": "EzXML.addelement!",
    "category": "Function",
    "text": "addelement!(parent::Node, name::AbstractString, content::AbstractString=\"\")\n\nAdd a new child element of name with content to parent.\n\n\n\n"
},

{
    "location": "references.html#DOM-tree-modifiers-1",
    "page": "References",
    "title": "DOM tree modifiers",
    "category": "section",
    "text": "setroot!\nlink!\nlinknext!\nlinkprev!\nunlink!\naddelement!"
},

{
    "location": "references.html#Base.find-Tuple{EzXML.Document,AbstractString}",
    "page": "References",
    "title": "Base.find",
    "category": "Method",
    "text": "find(doc::Document, xpath::AbstractString)\n\nFind nodes matching xpath XPath query from doc.\n\n\n\n"
},

{
    "location": "references.html#Base.findfirst-Tuple{EzXML.Document,AbstractString}",
    "page": "References",
    "title": "Base.findfirst",
    "category": "Method",
    "text": "findfirst(doc::Document, xpath::AbstractString)\n\nFind the first node matching xpath XPath query from doc.\n\n\n\n"
},

{
    "location": "references.html#Base.findlast-Tuple{EzXML.Document,AbstractString}",
    "page": "References",
    "title": "Base.findlast",
    "category": "Method",
    "text": "findlast(doc::Document, xpath::AbstractString)\n\nFind the last node matching xpath XPath query from doc.\n\n\n\n"
},

{
    "location": "references.html#Base.find-Tuple{EzXML.Node,AbstractString}",
    "page": "References",
    "title": "Base.find",
    "category": "Method",
    "text": "find(node::Node, xpath::AbstractString)\n\nFind nodes matching xpath XPath query starting from node.\n\n\n\n"
},

{
    "location": "references.html#Base.findfirst-Tuple{EzXML.Node,AbstractString}",
    "page": "References",
    "title": "Base.findfirst",
    "category": "Method",
    "text": "findfirst(node::Node, xpath::AbstractString)\n\nFind the first node matching xpath XPath query starting from node.\n\n\n\n"
},

{
    "location": "references.html#Base.findlast-Tuple{EzXML.Node,AbstractString}",
    "page": "References",
    "title": "Base.findlast",
    "category": "Method",
    "text": "findlast(node::Node, xpath::AbstractString)\n\nFind the last node matching xpath XPath query starting from node.\n\n\n\n"
},

{
    "location": "references.html#XPath-query-1",
    "page": "References",
    "title": "XPath query",
    "category": "section",
    "text": "find(doc::Document, xpath::AbstractString)\nfindfirst(doc::Document, xpath::AbstractString)\nfindlast(doc::Document, xpath::AbstractString)\nfind(node::Node, xpath::AbstractString)\nfindfirst(node::Node, xpath::AbstractString)\nfindlast(node::Node, xpath::AbstractString)"
},

{
    "location": "references.html#Reader-node-types-1",
    "page": "References",
    "title": "Reader node types",
    "category": "section",
    "text": "Node type Integer\nEzXML.READER_NONE 0\nEzXML.READER_ELEMENT 1\nEzXML.READER_ATTRIBUTE 2\nEzXML.READER_TEXT 3\nEzXML.READER_CDATA 4\nEzXML.READER_ENTITY_REFERENCE 5\nEzXML.READER_ENTITY 6\nEzXML.READER_PROCESSING_INSTRUCTION 7\nEzXML.READER_COMMENT 8\nEzXML.READER_DOCUMENT 9\nEzXML.READER_DOCUMENT_TYPE 10\nEzXML.READER_DOCUMENT_FRAGMENT 11\nEzXML.READER_NOTATION 12\nEzXML.READER_WHITESPACE 13\nEzXML.READER_SIGNIFICANT_WHITESPACE 14\nEzXML.READER_END_ELEMENT 15\nEzXML.READER_END_ENTITY 16\nEzXML.READER_XML_DECLARATION 17"
},

{
    "location": "references.html#EzXML.depth-Tuple{EzXML.XMLReader}",
    "page": "References",
    "title": "EzXML.depth",
    "category": "Method",
    "text": "depth(reader::XMLReader)\n\nReturn the depth of the current node of reader.\n\n\n\n"
},

{
    "location": "references.html#EzXML.expandtree-Tuple{EzXML.XMLReader}",
    "page": "References",
    "title": "EzXML.expandtree",
    "category": "Method",
    "text": "expandtree(reader::XMLReader)\n\nExpand the current node of reader into a full subtree that will be available until the next read of node.\n\n\n\n"
},

{
    "location": "references.html#EzXML.nodetype-Tuple{EzXML.XMLReader}",
    "page": "References",
    "title": "EzXML.nodetype",
    "category": "Method",
    "text": "nodetype(reader::XMLReader)\n\nReturn the type of the current node of reader.\n\n\n\n"
},

{
    "location": "references.html#EzXML.name-Tuple{EzXML.XMLReader}",
    "page": "References",
    "title": "EzXML.name",
    "category": "Method",
    "text": "name(reader::XMLReader)\n\nReturn the name of the current node of reader.\n\n\n\n"
},

{
    "location": "references.html#EzXML.content-Tuple{EzXML.XMLReader}",
    "page": "References",
    "title": "EzXML.content",
    "category": "Method",
    "text": "content(reader::XMLReader)\n\nReturn the content of the current node of reader.\n\n\n\n"
},

{
    "location": "references.html#EzXML.namespace-Tuple{EzXML.XMLReader}",
    "page": "References",
    "title": "EzXML.namespace",
    "category": "Method",
    "text": "namespace(reader::XMLReader)\n\nReturn the namespace of the current node of reader.\n\n\n\n"
},

{
    "location": "references.html#Streaming-reader-1",
    "page": "References",
    "title": "Streaming reader",
    "category": "section",
    "text": "depth(::XMLReader)\nexpandtree(::XMLReader)\nnodetype(::XMLReader)\nname(::XMLReader)\ncontent(::XMLReader)\nnamespace(::XMLReader)"
},

{
    "location": "devnotes.html#",
    "page": "Developer Notes",
    "title": "Developer Notes",
    "category": "page",
    "text": ""
},

{
    "location": "devnotes.html#Developer-Notes-1",
    "page": "Developer Notes",
    "title": "Developer Notes",
    "category": "section",
    "text": "This package is built on top of libxml2 and the design is significantly influenced by it. The Node type is a proxy object that points to a C struct allocated by libxml2. There are several node-like types in libxml2 that have common fields to constitute an XML tree. These fields are always located at the first fields of struct definitions, so we can safely use them by casting a pointer to _Node. Especially, the first field, _private, is reserved for applications and EzXML.jl uses it to store a pointer to a Node object. That is, a Node object points to a node struct and the node struct keeps an opposite pointer to the Node object. These bidirectional references are especially important in this package.When creating a Node object from a pointer, the constructor first checks whether there is already a proxy object pointing to the same node. If it exists, the constructor extracts the proxy object from the _private field and then return it. Otherwise, it creates a new proxy object and stores a reference to it in _private. As a result, proxy objects pointing to the same node in an XML document are always unique and no duplication happens. This property is fundamental to resource management.A Node object has another field called owner that references another Node object or the object itself. The owner node is responsible for freeing memory resources of the node object allocated by libxml2. Freeing memories is done in the finalize_node function, which is registered using finalizer when creating a proxy node. If a node object does not own itself, there is almost nothing to do in finalize_node except canceling (i.e. assigning the null pointer) the _private field.  If a node object owns itself, it finalized all descendant nodes in finalize_node.  In this process, the owner node cancels all _private fields of its descendants because their finalizer may be called after finished freeing nodes, which may result in a segmentation fault. Another important role of keeping owner reference is that it prohibits owner objects from being deallocated by Julia's garbage collecter.Since the owner field is not managed by libxml2, EzXML.jl needs to update the field when changing the structure of an XML tree. For example, linking a tree with another tree will lead to an inconsistent situation where descendants nodes reference different owner nodes. update_owners! updates the owner node of a whole tree so that this situation won't happen. Therefore, functions like link! and unlink! update owner objects by calling this function."
},

]}
