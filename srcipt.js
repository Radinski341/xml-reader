document.getElementById('loadData').addEventListener('click', function() {
    const url = "https://test.ce2s.net/Study.xml";

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");

            function queryXML(path) {
                const result = xmlDoc.evaluate(path, xmlDoc, null, XPathResult.ANY_TYPE, null);
                let node, nodes = [];
                while (node = result.iterateNext()) {
                    nodes.push(node.textContent);
                }
                return nodes;
            }

            const paths = {
                sys_System: "//Item[@alias='sys_System']/name/text()",
                sm_Study: "//Item[@alias='sm_Study']/name/text() | //Item[@alias='sm_Study']/state/text()",
                sm_Task: "//Item[@alias='sm_Task']/keyed_name/text()",
                ar_SimulationResult: "//Item[@alias='ar_SimulationResult']/*[self::ar_resultname or self::ar_resultvalue or self::ar_resultunit or self::ar_target_met]/text()",
                re_Requirement: "//Item[@alias='re_Requirement']/ar_conditionexp/text()"
            };

            const table = document.createElement("table");
            table.style.width = "100%";
            table.setAttribute("border", "1");
            const headerRow = table.insertRow();
            const headers = ["Alias", "Data"];
            headers.forEach(headerText => {
                let headerCell = document.createElement("th");
                headerCell.textContent = headerText;
                headerRow.appendChild(headerCell);
            });

            for (const key in paths) {
                const row = table.insertRow();
                const cell1 = row.insertCell();
                cell1.textContent = key;
                const cell2 = row.insertCell();
                cell2.textContent = queryXML(paths[key]).join(", ");
            }

            const tableContainer = document.getElementById('tableContainer');
            tableContainer.innerHTML = ''; 
            tableContainer.appendChild(table);

            document.getElementById('exportCSV').style.display = 'inline'; 
        })
        .catch(error => {
            console.error('Error fetching the XML:', error);
        });
});

document.getElementById('exportCSV').addEventListener('click', function() {
    const table = document.querySelector('table');
    const rows = Array.from(table.rows).map(row => 
        Array.from(row.cells).map(cell => `"${cell.textContent.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'export.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
