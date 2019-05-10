import React from 'react'
import { HashLink } from 'react-router-hash-link';
import './css/Footer.css'

const Footer = props => (
  <footer>
    Created by <a href="https://github.com/michaloslav">Michael Farník</a>
    <span> | </span>
    <a href="https://goo.gl/forms/jdesExEMegbkLPjp2" target="_blank" rel="noopener noreferrer">Feedback</a>
    <span> | </span>
    <HashLink to="/about#contact">Contact</HashLink>
    <div>
      Icon made by <a href="https://www.flaticon.com/authors/kiranshastry" title="Kiranshastry" target="_blank" rel="noopener noreferrer">Kiranshastry</a> from <a href="https://www.flaticon.com/" title="Flaticon" target="_blank" rel="noopener noreferrer">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank" rel="noopener noreferrer">CC 3.0 BY</a>
    </div>
  </footer>
)

export default Footer
