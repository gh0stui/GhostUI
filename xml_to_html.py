import xml.etree.ElementTree as ET
from anytree import AnyNode
import textwrap

def any_tree_to_html(node):
    """Generate HTML from AnyTree node with clean indent and minimal hierarchy."""
    results = ''

    if 'RECYCLERVIEW' in node.type:
        node_type = 'Recycler'
    elif 'IMAGEVIEW' in node.type:
        node_type = 'img'
    elif 'BUTTON' in node.type:
        node_type = 'button'
    elif 'EDITTEXT' in node.type:
        node_type = 'input'
    elif 'TEXTVIEW' in node.type:
        node_type = 'p'
    else:
        node_type = 'div'

    attrs = []
    if getattr(node, 'clickable', False):
        attrs.append('clickable')
    if getattr(node, 'long_clickable', False):
        attrs.append('long-clickable')
    if getattr(node, 'scrollable', False):
        attrs.append('scrollable')

    rendered_children = []
    for child in node.children:
        child_html = any_tree_to_html(child)
        if child_html.strip():
            rendered_children.append(child_html)

  
    base_render = node.clickable or node.long_clickable or node.scrollable
    child_count_based_render = len(rendered_children) >= 2 or 'RECYCLERVIEW' in node.type

    if base_render and node.bounds:
        attrs.append(f'bounds="{node.bounds}"')
    should_render = base_render or child_count_based_render

    attr_str = ' '.join(attrs)
    indent = '  '

    if (node.is_leaf and node.visible) or (not rendered_children and node.children and node.visible):
        if should_render or node.text or node.content_desc: 
            if not node.text and node.content_desc:
                node.text = node.content_desc
            return f'<{node_type}{' ' + attr_str if attr_str else ""}>{node.text or ""}</{node_type}>\n'
        else:
            return ''

    if should_render:
        results += f'<{node_type}{(" " + attr_str) if attr_str else ""}>\n'
        for child_html in rendered_children:
            results += textwrap.indent(child_html, indent)
        results += f'</{node_type}>\n'
    else:
        for child_html in rendered_children:
            results += child_html

    return results


def parse_xml_to_anytree(xml_path):
    """Parses a UI hierarchy XML file into an AnyTree structure."""
    tree = ET.parse(xml_path)
    root_element = tree.getroot()

    node_id_counter = [0]

    def create_node(element, parent=None):
        node_id = node_id_counter[0]
        node_id_counter[0] += 1

        resource_id = element.attrib.get('resource-id', '')
        content_desc = element.attrib.get('content-desc', '')
        text = element.attrib.get('text', '')
        visible = element.attrib.get('displayed', 'true') == 'true'
        clickable = element.attrib.get('clickable', 'false') == 'true'
        long_clickable = element.attrib.get('long-clickable', 'false') == 'true'
        scrollable = element.attrib.get('scrollable', 'false') == 'true'
        focusable = element.attrib.get('focusable', 'false') == 'true'
        bounds = element.attrib.get('bounds', '')
        class_name = element.attrib.get('class', 'android.view.View')
        enabled = element.attrib.get('enabled', 'true') == 'true'

        is_leaf = len(element) == 0 and visible

        node = AnyNode(
            id=node_id,
            parent=parent,
            type=class_name.split('.')[-1].upper(),  # e.g., "android.widget.Button" → "BUTTON"
            text=text,
            content_desc=content_desc,
            resource_id=resource_id.split('/')[-1].split('_') if '/' in resource_id else [resource_id],
            visible=visible,
            clickable=clickable,
            long_clickable=long_clickable,
            scrollable=scrollable,
            focusable=focusable,
            bounds=bounds,
            enabled=enabled,
            is_leaf=is_leaf,
            leaf_id=-1,
        )

        for child in element:
            create_node(child, node)

        return node

    root_node = create_node(root_element[0])
    return root_node



def xml_to_html(xml_path, output_path=None):
    root = parse_xml_to_anytree(xml_path)
    html_output = any_tree_to_html(root)

    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_output)
    else:
        print(html_output)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--xml', required=True, help='Path to the XML file')
    parser.add_argument('--out', help='Output HTML file (optional)')
    args = parser.parse_args()

    xml_to_html(args.xml, args.out)