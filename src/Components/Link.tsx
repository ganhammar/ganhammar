import { Link } from "react-router-dom";
import styled from "styled-components";

const StyledLink = styled(Link)`
  color: #f9f9f9;
  text-decoration: none;
  border-bottom: 0.063rem solid #f9f9f9;
  &:hover {
    border: none;
  }
`;

export default StyledLink;