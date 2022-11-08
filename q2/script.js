
        function getTimePart(str) {
            return str.slice(11, 16);
        }

        function createTD(textContents) {
            let td = document.createElement('td');
            let text = document.createTextNode(textContents);
            td.appendChild(text)
            return td
        }