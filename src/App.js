import React, { Component } from 'react';
import './App.css';
import { Formik, Form, Field } from 'formik';

export default class App extends Component {

  sortByAgeFn = (a,b) => b.birthYear - a.birthYear;
  sortByNameFn = (a,b) => {
    if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
    if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
    return 0;
  }

  constructor(props) {
    super(props);

    this.state = {
      pets: [],
      filterValue: null,
      currentSort: null,
      currentSortFn: () => 0,
      sortOrderAsc: true,
      popupVisible: false
    };

    fetch("http://127.0.0.1:8080/pets-data.json")
      .then(resp => resp.json())
      .then(this.setState.bind(this));
  }

  sortBy = attribute => () => {
    const sortFnName = `sortBy${attribute && attribute[0].toUpperCase() + attribute.slice(1)}Fn`
    this.setState({
      currentSortFn: this.state.currentSort === attribute && this.state.sortOrderAsc
        ? (a,b) => -this[sortFnName](a,b) 
        : this[sortFnName],
      currentSort: attribute,
      sortOrderAsc: this.state.currentSort === attribute
        ? !this.state.sortOrderAsc
        : true
    })
  }

  filterBySpecie = ev => {
    this.setState({
      filterValue: ev.nativeEvent.target.value
    })
  }

  openPopup = () => {
    this.setState({
      popupVisible: true
    })
  }

  removePet = name => () => {
    this.setState({
      pets: this.state.pets.filter(pet => pet.name !== name)
    })
  }

  getPets = () => this.state.pets
    .filter(pet => this.state.filterValue
      ? pet.species === this.state.filterValue
      : true)
    .sort(this.state.currentSortFn)

  render() {
    console.log(this.state);
    const currentYear = new Date().getFullYear();
    return (
      <main className="App">
        <section className="sorting">
          <h2>Sortowanie</h2>
          <button className="sort" onClick={this.sortBy("age")}>Wiek</button>
          <button className="sort" onClick={this.sortBy("name")}>Imie</button>
        </section>
        <section className="filters">
          <h2>Filtry</h2>
          <select onChange={this.filterBySpecie}>
            <option value="" defaultValue>Wszystkie</option>
            <option value="Cat">Koty</option>
            <option value="Dog">Psy</option>
          </select>
        </section>
        <section className="list">
        { 
          this.getPets().map(pet =>
          <div className="element" key={pet.name}>
            <img src={pet.photo} alt={pet.name}/>
            <p>Imię: {pet.name}</p>
            <p>Wiek: {currentYear - pet.birthYear} lat</p>
            <p>Gatunek: {pet.species}</p>
            { pet.favFoods && 
            <div className="favourite-food">
              <h2>Ulubione jedzenie:</h2>
              { pet.favFoods.map(food => <span className="tag" key={food} dangerouslySetInnerHTML={{__html: food}}></span>) }
            </div>
            }
            <button
              className="remove"
              onClick={this.removePet(pet.name)}
            >X</button>
          </div>)
        }
        </section>
        <button className="add" onClick={this.openPopup}>+</button>
        { this.state.popupVisible &&
        <div className="overlay">
          <section className="popup">
            <Formik
              initialValues={{
                name: '',
                age: '',
                species: '',
                photo: '',
                favFoods: '',
              }}
              validate={values =>  {
                if(!values.name || !values.species || !values.age || !values.photo) return {
                  requiredFields: true
                }
                if(parseInt(values.age)!=values.age) return {
                  age: true
                }
                return {}
              }}
              onSubmit={(values, { setSubmitting }) => {
                debugger
                this.setState({
                  popupVisible: false,
                  pets: [...this.state.pets,
                  {
                    name : values.name,
                    species : values.species,
                    favFoods : values.favFoods,
                    birthYear : new Date().getFullYear() - values.age,
                    photo : values.photo
                  }]
                })
                setSubmitting(false);
              }}
            >
            {({ errors }) => (
              <Form>
                <Field type="text" name="name" placeholder="Imię"/>
                <Field type="text" name="age" placeholder="Wiek"/>
                <Field type="text" name="species" placeholder="Gatunek"/>
                <Field type="text" name="photo" placeholder="Url zdjęcia"/>
                <Field type="text" name="favFoods" placeholder="Jedzenie"/>
                <section className="fav-foods"></section>
                <section className="errors">
                  {errors.requiredFields ? <p>Wypełnij wszystkie pola</p> : ""}
                  {!errors.requiredFields && errors.age ? <p>Wiek musi być pełną liczbą</p>: ""}
                </section>
                <button type="submit">Dodaj</button>
              </Form>
            )}
            </Formik>
          </section>
        </div>
        }
      </main>
    );
  }
}
