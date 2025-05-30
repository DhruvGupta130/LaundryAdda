import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, roles }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (roles?.length && !roles.includes(user.role)) {
        return <Navigate to="/not-found" replace />;
    }
    return children;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;