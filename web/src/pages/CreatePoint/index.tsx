import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import axios from "axios";
import api from "../../services/api";

import "./styles.css";

import logo from "../../assets/logo.svg";

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string; 
}

interface IBGECityResponse {
    nome: string; 
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [formData, setFormData] = useState({
       name: "",
       email: "",
       whatsapp: "" 
    });

    const [seletectedUf, setSelectedUf] = useState("0");
    const [seletectedCity, setSelectedCity] = useState("0");
    const [selectedPosition, setSeletedPosition] = useState<[number, number]>([0, 0]);
    const [selectedItems, setSeletedItems] = useState<number[]>([]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;

            setInitialPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get("items").then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
            .then(response => {
                const ufInitials = response.data.map(uf => uf.sigla);
                
                setUfs(ufInitials);
            });
    }, []);

    useEffect(() => {
        if (seletectedUf === "0") {
            return;
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${seletectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);

                setCities(cityNames);
            });
            
    }, [seletectedUf]);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectedUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;

        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSeletedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target;
        
        setFormData({ ...formData, [name]: value});
    }
    
    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSeletedItems(filteredItems);
        } else {
            setSeletedItems([ ...selectedItems, id ]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = seletectedUf;
        const city = seletectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude, 
            longitude,
            items
        }

        await api.post("points", data);

        alert("Collection point created");

        history.push("/");
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Return to Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Register a<br />collecting point</h1>

                <fieldset>
                    <legend>
                        <h2>Data</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Entity name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Address</h2>
                        <span>Select the address in the map</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker 
                            position={selectedPosition}
                        />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">State (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={seletectedUf} 
                                onChange={handleSelectUf}
                            >
                                <option value="0">Select one UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">City</label>
                            <select 
                                name="city" 
                                id="city" 
                                value={seletectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Select one City</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>   
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Items of collection</h2>
                        <span>Select one or more items bellow</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? "selected" : ""}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">Register collection point</button>
            </form>
        </div>
    );
};

export default CreatePoint;