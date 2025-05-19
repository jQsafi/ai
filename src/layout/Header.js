import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header id="mainNav" class="navbar">
        <div class="navbar-inner">
            <div class="container-fluid">
                <a class="brand" href="https://app.gumroad.com/products">
                    <img src="https://d33v4339jhl8k0.cloudfront.net/docs/assets/5c4657ad2c7d3a66e32d763f/images/61a0dd739ccf62287e5fa408/Color.png" alt="Gumroad Help Center" width="75" height="75">
                </a>

                <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                    <span class="sr-only">Toggle Navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>

                <div class="nav-collapse collapse">
                    <nav role="navigation">
                        <ul class="nav">
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </header>
    );
};
export default Header;

