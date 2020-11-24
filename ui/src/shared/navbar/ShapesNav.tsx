import React, { ReactElement, Fragment } from 'react';
import { Nav } from 'react-bootstrap';
import { Link , useLocation } from 'react-router-dom';


const ShapesNav: React.FunctionComponent = (props) => {
    const basepath = '/idaishapes';
    const createEntry = (name: string, route: string) => createNavEntry(name, `${basepath}${route}`);

    return (
        <Fragment>
            <Nav className="mr-auto">
                { createEntry('Browse & Select', '/browseSelect')}
                { createEntry('Find', '/find')}
                { createEntry('Export', '/export')}
                { createEntry('Edit', '/edit')}
                { createEntry('Mining', '/mining')}
            </Nav>
   </Fragment>
    );
};

export default ShapesNav;


const createNavEntry = (name: string, route: string): ReactElement => (
       <Nav.Link as="span">
            <Link to={ route}>
            { name}
            </Link>
        </Nav.Link>
);