function xhr(method, path, data, callback) {
  var x = new XMLHttpRequest()
  x.open(method, '/files/' + path, true);
  x.onreadystatechange = function () {
    if (x.readyState == 4) {
      callback(x.responseText);
    }
  };
  if (data) {
    x.setRequestHeader('Content-Type', 'application/octet-stream');
  }
  x.send(data);
}

function deleteFile(filename) {
  xhr('DELETE', 'data/' + filename, null, updateFileList);
}

function updateFileList() {
  function ce(tagname) {
    return document.createElement(tagname);
  }

  function createRow(item) {
    var tr = ce('tr');
    var td1 = tr.appendChild(ce('td'));
    var td2 = tr.appendChild(ce('td'));
    td1.innerText = item.filename;
    var a1 = td2.appendChild(ce('a'));
    td2.appendChild(document.createTextNode(' '));
    var a2 = td2.appendChild(ce('a'));
    a1.innerText = 'Download';
    a1.href = '/files/data/' + item.filename;
    a1.target = '_blank';
    a2.innerText = 'Delete';
    a2.href = '#';
    a2.onclick = function(e) {
      deleteFile(item.filename);
      e.preventDefault();
    };
    return tr;
  }

  xhr('GET', 'list', null, function (responseText) {
    var json = JSON.parse(responseText);
    var tbody = document.getElementById('list');
    while (tbody.childNodes.length) {
      tbody.removeChild(tbody.childNodes[0]);
    }

    for (var i = 0; i < json.length; ++i) {
      tbody.appendChild(createRow(json[i]));
    }
  });
}

function fileChange() {
  var file = document.getElementById('file').files[0];
  xhr('POST', 'data/' + file.name, file, updateFileList);
}

function upload() {
  document.getElementById('form').reset();
  document.getElementById('file').click();
}

window.onload = updateFileList;
