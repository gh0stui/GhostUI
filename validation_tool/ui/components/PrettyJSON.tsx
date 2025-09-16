export const PrettyJSON = (data) => {
    return (
        <pre style={{
            background: "#f4f4f4",
            padding: "10px",
            borderRadius: "5px",
            maxWidth: "800px", // Limit width
            whiteSpace: "pre-wrap", // Wrap text
            wordBreak: "break-word" // Prevent overflow
        }}>

            {JSON.stringify(data, null, 4)} {/* Pretty-print JSON */}
        </pre>
    );
}
