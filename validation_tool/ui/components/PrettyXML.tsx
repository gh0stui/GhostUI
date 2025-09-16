export const PrettyXML = ({ xmlString }: { xmlString: string }) => {
    function formatXML(xml) {
        const PADDING = "    "; // 4 spaces
        const reg = /(>)(<)(\/*)/g;
        let formatted = "";
        let pad = 0;

        xml = xml.replace(reg, "$1\n$2$3"); // Add new lines
        xml.split("\n").forEach((node) => {
            let indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0;
            } else if (node.match(/^<\/\w/)) {
                if (pad > 0) pad -= 1;
            } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
                indent = 1;
            }

            formatted += PADDING.repeat(pad) + node + "\n";
            pad += indent;
        });

        return formatted.trim();
    }

    return (
        <pre style={{ background: "#eef", padding: "10px", borderRadius: "5px", whiteSpace: "pre-wrap" }}>
            {formatXML(xmlString)}
        </pre>
    );
}

