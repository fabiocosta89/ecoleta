import React from "react";
import { FiLogIn } from "react-icons/fi";
import { Link } from "react-router-dom";

import "./styles.css";

import logo from "../../assets/logo.svg"; 

const Home = () => {
    return (
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Ecoleta"/>
                </header>

                <main>
                    <h1>Your marketplace for recyclage.</h1>
                    <p>We help people find places for recyclage collection.</p>

                    <Link to="/create-point">
                        <span>
                            <FiLogIn />
                        </span>
                        <strong>Register a point of collection</strong>
                    </Link>
                </main>
            </div>
        </div>
    );
};

export default Home;