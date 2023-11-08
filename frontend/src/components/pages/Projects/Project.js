import CustomNavBar from '../../common/navBar.js'
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { useParams } from "react-router-dom";


import React, { useState, useEffect, useRef } from "react";

function Project() {

  const url = "https://ai.ptisp.systems";
  const [data, setData] = useState({ projects: [] });
  const [files, setFiles] = useState({ files: [] });
  const [file, setFile] = useState(null);
  const [embeddings, setEmbeddings] = useState(null);
  const urlForm = useRef(null);
  const depthForm = useRef(null);
  var { projectName } = useParams();


  // TODO: error handling
  const fetchProject = (projectName) => {
    return fetch(url + "/projects/" + projectName)
      .then((res) => res.json())
      .then((d) => setData(d))
  }
  // TODO: error handling
  const fetchFiles = (projectName) => {
    return fetch(url + "/projects/" + projectName + "/embeddings/files")
      .then((res) => res.json())
      .then((d) => setFiles(d))
  }

  // TODO: error handling
  const handleDeleteClick = (fileName) => {
    alert(fileName);
    fetch(url + "/projects/" + projectName + "/embeddings/files/" + fileName, { method: 'DELETE' })
      .then(() => {
        fetchProject(projectName);
        fetchFiles(projectName);
      });
  }

  const handleViewClick = (fileName) => {
    fetch(url + "/projects/" + projectName + "/embeddings/find", {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        "source": fileName
      }),
    })
      .then(response => response.json())
      .then(response => {
        setEmbeddings(response);
      })
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // TODO: error handling and response
  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      fetch(url + "/projects/" + projectName + "/embeddings/ingest/upload", {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(() => {
          fetchProject(projectName);
          fetchFiles(projectName);
        })
    } else {
      if (urlForm.current.value !== "") {
        var ingestUrl = urlForm.current.value;
        var ingestUrlDepth = depthForm.current.value;
        var body = {};

        if (ingestUrlDepth !== "") {
          body = {
            "url": ingestUrl,
            "recursive": true,
            "depth": parseInt(ingestUrlDepth)
          }
        } else {
          body = {
            "url": ingestUrl
          }
        }
        fetch(url + "/projects/" + projectName + "/embeddings/ingest/url", {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(body),
        })
          .then(response => response.json())
          .then(() => {
            fetchProject(projectName);
            fetchFiles(projectName);
          })
      }
    }
  }

  useEffect(() => {
    document.title = 'RestAI Project ' + projectName;
    fetchProject(projectName);
    fetchFiles(projectName);
  }, [projectName]);

  return (
    <>
      <CustomNavBar />
      <Container style={{ marginTop: "20px" }}>
        <Row style={{ marginTop: "20px" }}>
          <Col sm={6}>
            <h1>Status</h1>
            <ListGroup>
              <ListGroup.Item>Project: {data.project}</ListGroup.Item>
              <ListGroup.Item>LLM: {data.llm}</ListGroup.Item>
              <ListGroup.Item>Embeddings: {data.embeddings}</ListGroup.Item>
              <ListGroup.Item>Documents: {data.documents}</ListGroup.Item>
              <ListGroup.Item>Metadatas: {data.metadatas}</ListGroup.Item>
            </ListGroup>
          </Col>
          <Col sm={6}>
            <h1>Ingest File</h1>
            <Form onSubmit={onSubmitHandler}>
              <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                <Form.Label column sm={1}>
                  File
                </Form.Label>
                <Col sm={11}>
                  <Form.Control onChange={handleFileChange} type="file" />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                <Form.Label column sm={1}>
                  Url
                </Form.Label>
                <Col sm={8}>
                  <Form.Control ref={urlForm} type="url" placeholder="Enter url" />
                </Col>
                <Col sm={3}>
                  <Form.Control ref={depthForm} type="number" placeholder="Depth" />
                </Col>
              </Form.Group>
              <Col sm={2}>
                <Button variant="dark" type="submit">Upload</Button>
              </Col>
            </Form>
            {
              file && (
                <Row>
                  <Col sm={6}>
                  </Col>
                  <Col sm={6}>
                    <h5>File details:</h5>
                    <ListGroup>
                      <ListGroup.Item>Type: {file.type}</ListGroup.Item>
                      <ListGroup.Item>Size: {file.size} bytes</ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
              )
            }
          </Col>
        </Row>
        <Row style={{ marginTop: "20px" }}>
          <h1>Files</h1>
          <Col sm={12}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Files</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  files.files.map((file, index) => {
                    return (
                      <tr key={index}>
                        <td>{index}</td>
                        <td>
                          {file}
                        </td>
                        <td>
                          <Button onClick={() => handleViewClick(file)} variant="dark">View</Button>{' '}
                          <Button onClick={() => handleDeleteClick(file)} variant="danger">Delete</Button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
            {
              embeddings && (
                <Row>
                  <Col sm={12}>
                    <h2>Embeddings:</h2>
                    <ListGroup style={{ height: "200px", overflowY: "scroll" }}>
                      <ListGroup.Item>IDS: {JSON.stringify(embeddings.ids)}</ListGroup.Item>
                      <ListGroup.Item>Embeddings: {JSON.stringify(embeddings.embeddings)}</ListGroup.Item>
                      <ListGroup.Item>Metadatas: {JSON.stringify(embeddings.metadatas)}</ListGroup.Item>
                      <ListGroup.Item>Documents: {JSON.stringify(embeddings.documents)}</ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
              )
            }
          </Col>
        </Row>

      </Container>
    </>
  );
}

export default Project;