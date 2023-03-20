import React, { Component, SyntheticEvent } from 'react';
import { Alert, Button, Form, Tab, Tabs } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import Layout from '../components/Layout';
import Crashdump from '../lib/crashdump.interface';
import Link from 'next/link';
import dynamic from 'next/dynamic';
type CrashdumpParserState = {
  parseError: string | null;
  parseErrorLink: string | null;
  previewError: string | null;
  previewErrorLink: string | null;
  parsedCrashdumpStr: string | null;
  parsedCrashdumpObj: Crashdump | null;
  loading: boolean;
  crashdump: string | null;
};
export default class CrashdumpParser extends Component {
  state: CrashdumpParserState = {
    parseError: null,
    parseErrorLink: null,
    previewError: null,
    previewErrorLink: null,
    parsedCrashdumpStr: null,
    parsedCrashdumpObj: null,
    loading: false,
    crashdump: null,
  };
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      crashdump: event.currentTarget.value,
    });
  };
  handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    this.setState({
      loading: true,
      parseError: null,
      parseErrorLink: null,
      previewError: null,
      previewErrorLink: null,
      parsedCrashdumpStr: null,
      parsedCrashdumpObj: null,
    });
    const response = await fetch('/api/parse-crashdump', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crashdump: this.state.crashdump!,
      }),
    });
    const json = await response.json();
    if (response.status === 400) {
      return this.setState({
        loading: false,
        parseError: 'Sorry, an error occurred decoding your crashdump.',
        parseErrorLink: '/support#decode-crashdump-error'
      });
    }
    if (json.preview) {
      this.setState({
        parsedCrashdumpObj: JSON.parse(json.crashdump),
      });
    } else {
      this.setState({
        previewError:
          'Sorry, your crashdump could not be previewed. Raw JSON is still available.',
        previewErrorLink: '/support#preview-not-avail-error'
      });
    }
    this.setState({
      loading: false,
      parsedCrashdumpStr: json.crashdump,
    });
  };
  saveCrashdump = () => {
    const blob = new Blob([this.state.parsedCrashdumpStr!], {
      type: 'application/json;charset=utf-8',
    });
    saveAs(blob, 'crashdump.json');
  };
  render() {
    const {
      parseError,
      parseErrorLink,
      previewError,
      previewErrorLink,
      parsedCrashdumpStr,
      parsedCrashdumpObj,
      loading,
      crashdump,
    } = this.state;
    let CrashdumpPreview: any = null;
    if (parsedCrashdumpStr && !previewError) {
      CrashdumpPreview = dynamic(import('../components/CrashdumpPreview'), {
        loading: () => <p>Loading preview<span className="dots" /></p>,
      });
    }
    return (
      <Layout title="Crashdump Parser" showNav={true}>
        {parseError ? <Alert variant="danger">{parseError} <Link href={parseErrorLink!}>More info.</Link></Alert> : null}
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Label>Crashdump</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              onChange={this.handleChange}
              placeholder="Paste crashdump here"
              className="mb-3"
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            disabled={!crashdump || loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1" />{' '}
                Decoding
                <span className="dots" />
              </>
            ) : (
              'Decode'
            )}
          </Button>
          <small className="text-muted">
            <br />
            Your crashdump will be sent to the server for decoding.
          </small>
        </Form>
        {parsedCrashdumpStr ? (
          <Tabs defaultActiveKey="preview" className="mb-3 mt-3">
            <Tab eventKey="preview" title="Preview">
              {previewError ? (
                <Alert variant="danger">{previewError} <Link href={previewErrorLink!}>More info.</Link></Alert>
              ) : (
                <CrashdumpPreview crashdump={parsedCrashdumpObj!} />
              )}
            </Tab>
            <Tab eventKey="raw" title="Raw JSON">
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={12}
                  value={parsedCrashdumpStr}
                  disabled
                  className="mb-3 raw-json-crashdump"
                />
              </Form.Group>
              <Button variant="primary" onClick={this.saveCrashdump}>
                Download
              </Button>
            </Tab>
          </Tabs>
        ) : null}
      </Layout>
    );
  }
}