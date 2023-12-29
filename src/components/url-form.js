import Form from 'react-bootstrap/Form';

const URLForm = () => {
    return (
        <Form>
            <Form.Label>Image Link</Form.Label>
            <Form.Control type='url' placeholder='e.g.: url' />
        </Form>
    )
}

export default URLForm;