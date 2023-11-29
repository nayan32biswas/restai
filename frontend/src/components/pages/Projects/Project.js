import { Container, Table, Row, Form, Col, Button, ListGroup, Alert } from 'react-bootstrap';
import { NavLink, useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from '../../common/AuthProvider.js';

function Project() {

  const url = process.env.REACT_APP_RESTAI_API_URL || "";
  const [data, setData] = useState({ projects: [] });
  const [files, setFiles] = useState({ files: [] });
  const [file, setFile] = useState(null);
  const [urls, setUrls] = useState({ urls: [] });
  const [embeddings, setEmbeddings] = useState(null);
  const [uploadResponse, setUploadResponse] = useState({ type: null });
  const [canSubmit, setCanSubmit] = useState(true);
  const [error, setError] = useState([]);
  const urlForm = useRef(null);
  const fileForm = useRef(null);
  var { projectName } = useParams();
  const { getBasicAuth } = useContext(AuthContext);
  const user = getBasicAuth();

  const handleDeleteProjectClick = (projectName) => {
    if (window.confirm("Delete " + projectName + "?")) {
      fetch(url + "/projects/" + projectName, { method: 'DELETE', headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
        .then(function (response) {
          if (!response.ok) {
            response.json().then(function (data) {
              setError([...error, { "functionName": "onSubmitHandler", "error": data.detail }]);
            });
            throw Error(response.statusText);
          } else {
            window.location = "/admin"
          }
        })
        .catch(err => {
          setError([...error, { "functionName": "handleDeleteClick", "error": err.toString() }]);
        });
    }
  }

  const fetchProject = (projectName) => {
    return fetch(url + "/projects/" + projectName, { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => setData(d)
      ).catch(err => {
        setError([...error, { "functionName": "fetchProject", "error": err.toString() }]);
      });
  }

  const fetchFiles = (projectName) => {
    return fetch(url + "/projects/" + projectName + "/embeddings/files", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => setFiles(d)
      ).catch(err => {
        setError([...error, { "functionName": "fetchFiles", "error": err.toString() }]);
      });
  }

  const fetchUrls = (projectName) => {
    return fetch(url + "/projects/" + projectName + "/embeddings/urls", { headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }) })
      .then((res) => res.json())
      .then((d) => setUrls(d)
      ).catch(err => {
        setError([...error, { "functionName": "fetchUrls", "error": err.toString() }]);
      });
  }

  const handleDeleteClick = (source, type) => {
    if (window.confirm("Delete " + source + "?")) {
      fetch(url + "/projects/" + projectName + "/embeddings/" + type + "/" + btoa(source),
        {
          method: 'DELETE', headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth })
        }).then(() => {
          fetchProject(projectName);
          fetchFiles(projectName);
          fetchUrls(projectName);
        }).catch(err => {
          setError([...error, { "functionName": "handleDeleteClick", "error": err.toString() }]);
        });
    }
  }

  const handleResetEmbeddingsClick = () => {
    alert("Reset " + projectName + " embeddings");
    fetch(url + "/projects/" + projectName + "/embeddings/reset",
      {
        method: 'POST', headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth })
      }).then(() => {
        fetchProject(projectName);
        fetchFiles(projectName);
        fetchUrls(projectName);
      }).catch(err => {
        setError([...error, { "functionName": "handleResetEmbeddingsClick", "error": err.toString() }]);
      });
  }

  const handleViewClick = (source) => {
    fetch(url + "/projects/" + projectName + "/embeddings/find", {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
      body: JSON.stringify({
        "source": source
      }),
    })
      .then(response => response.json())
      .then(response => {
        setEmbeddings(response);
      }).catch(err => {
        setError([...error, { "functionName": "handleViewClick", "error": err.toString() }]);
      });
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const resetFileInput = () => {
    // 👇️ reset input value
    setFile(null);
    fileForm.current.value = null;
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (canSubmit) {
      setCanSubmit(false);
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        fetch(url + "/projects/" + projectName + "/embeddings/ingest/upload", {
          method: 'POST',
          headers: new Headers({ 'Authorization': 'Basic ' + user.basicAuth }),
          body: formData,
        })
          .then(response => response.json())
          .then((response) => {
            response.type = "file";
            resetFileInput();
            setUploadResponse(response);
            fetchProject(projectName);
            fetchFiles(projectName);
            setCanSubmit(true);
          }).catch(err => {
            setError([...error, { "functionName": "onSubmitHandler FILE", "error": err.toString() }]);
            setCanSubmit(true);
          });
      } else {
        if (urlForm.current.value !== "") {
          var ingestUrl = urlForm.current.value;
          var body = {};

          body = {
            "url": ingestUrl
          }

          fetch(url + "/projects/" + projectName + "/embeddings/ingest/url", {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + user.basicAuth }),
            body: JSON.stringify(body),
          })
            .then(response => {
              if (response.status === 500) {
                setError([...error, { "functionName": "onSubmitHandler URL", "error": response.statusText }]);
              }
              return response.json();
            })
            .then((response) => {
              response.type = "url";
              setUploadResponse(response);
              fetchProject(projectName);
              fetchUrls(projectName);
              setCanSubmit(true);
            }).catch(err => {
              setError([...error, { "functionName": "onSubmitHandler URL", "error": err.toString() }]);
              setCanSubmit(true);
            });
        }
      }
    }
  }

  useEffect(() => {
    document.title = 'RestAI Project ' + projectName;
    fetchProject(projectName);
    fetchFiles(projectName);
    fetchUrls(projectName);
  }, [projectName]);

  return (
    <>
      {error.length > 0 &&
        <Alert variant="danger">
          {JSON.stringify(error)}
        </Alert>
      }
      <Container style={{ marginTop: "20px" }}>
        <Row style={{ marginTop: "20px" }}>
          <Col sm={6}>
            <h1>Status</h1>
            <ListGroup>
              <ListGroup.Item><b>Project:</b> {data.name}</ListGroup.Item>
              <ListGroup.Item><b>LLM:</b> {data.llm}</ListGroup.Item>
              <ListGroup.Item><b>Embeddings:</b> {data.embeddings} <Button onClick={() => handleResetEmbeddingsClick()} variant="danger">Reset</Button></ListGroup.Item>
              <ListGroup.Item><b>Documents:</b> {data.documents}</ListGroup.Item>
              <ListGroup.Item><b>Metadatas:</b> {data.metadatas}</ListGroup.Item>
              <ListGroup.Item><b>System:</b> {data.system}</ListGroup.Item>
              <ListGroup.Item><b>Sandboxed:</b> {data.sandboxed ? (<span>✅</span>) : (<span>❌</span>)}</ListGroup.Item>
              <ListGroup.Item><b>Censorship:</b> {data.censorship}</ListGroup.Item>
            </ListGroup>
          </Col>
          <Col sm={6}>
            <h1>Ingest</h1>
            <Form onSubmit={onSubmitHandler}>
              <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                <Col sm={12}>
                  <Form.Control ref={fileForm} onChange={handleFileChange} type="file" />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                <Col sm={12}>
                  <Form.Control ref={urlForm} type="url" placeholder="Enter url" />
                </Col>
              </Form.Group>
              <Col sm={2}>
                <Button variant="dark" type="submit">Ingest</Button>
              </Col>
            </Form>
            {
              uploadResponse.type === "file" ?
                <Row>
                  <Col sm={12}>
                    <h5>Ingest Result:</h5>
                    <ListGroup>
                      <ListGroup.Item>FileName: {uploadResponse.filename}</ListGroup.Item>
                      <ListGroup.Item>Type: {uploadResponse.type}</ListGroup.Item>
                      <ListGroup.Item>Texts: {uploadResponse.texts}</ListGroup.Item>
                      <ListGroup.Item>Documents: {uploadResponse.documents}</ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
                : (
                  uploadResponse.type === "url" &&
                  <Row>
                    <Col sm={12}>
                      <h5>Ingest Result:</h5>
                      <ListGroup>
                        <ListGroup.Item>Url: {uploadResponse.url}</ListGroup.Item>
                        <ListGroup.Item>Texts: {uploadResponse.texts}</ListGroup.Item>
                        <ListGroup.Item>Documents: {uploadResponse.documents}</ListGroup.Item>
                      </ListGroup>
                    </Col>
                  </Row>
                )
            }
            <hr />
            <h1>Actions</h1>
            <NavLink
              to={"/projects/" + data.name + "/edit"}
            >
              <Button variant="dark">Edit</Button>{' '}
            </NavLink>
            <NavLink
              to={"/projects/" + data.name + "/chat"}
            >
              <Button variant="dark">Chat</Button>{' '}
            </NavLink>
            <NavLink
              to={"/projects/" + data.name + "/question"}
            >
              <Button variant="dark">Question</Button>{' '}
            </NavLink>
            <Button onClick={() => handleDeleteProjectClick(data.name)} variant="danger">Delete</Button>
          </Col>
        </Row>
        <hr />
        <Row style={{ marginTop: "20px" }}>
          <h1>Embeddings</h1>
          <Col sm={12} style={files.files.length > 5 || urls.urls.length > 5 ? { height: "400px", overflowY: "scroll" } : {}}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  files.files.map((file, index) => {
                    return (
                      <tr key={index}>
                        <td>{index}</td>
                        <td>File</td>
                        <td>
                          {file}
                        </td>
                        <td>
                          <Button onClick={() => handleViewClick(file)} variant="dark">View</Button>{' '}
                          <Button onClick={() => handleDeleteClick(file, "files")} variant="danger">Delete</Button>
                        </td>
                      </tr>
                    )
                  })
                }
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                {
                  urls.urls.map((url, index) => {
                    return (
                      <tr key={index}>
                        <td>{index}</td>
                        <td>Url</td>
                        <td>
                          {url}
                        </td>
                        <td>
                          <Button onClick={() => handleViewClick(url)} variant="dark">View</Button>{' '}
                          <Button onClick={() => handleDeleteClick(url, "url")} variant="danger">Delete</Button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
          </Col>
          {
            embeddings && (
              <Row>
                <Col sm={12}>
                  <h2>Details:</h2>
                  <ListGroup style={{ height: "400px", overflowY: "scroll" }}>
                    <ListGroup.Item><b>IDS:</b> <pre class="json">{JSON.stringify(embeddings.ids, null, 2)}</pre></ListGroup.Item>
                    <ListGroup.Item><b>Metadatas:</b> <pre class="json">{JSON.stringify(embeddings.metadatas, null, 2)}</pre></ListGroup.Item>
                    <ListGroup.Item><b>Documents:</b> <pre class="json">{JSON.stringify(embeddings.documents, null, 2)}</pre></ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            )
          }
        </Row>
      </Container>
    </>
  );
}

export default Project;