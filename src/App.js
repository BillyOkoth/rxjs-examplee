import {useEffect ,useState} from 'react';
import {from,BehaviorSubject} from 'rxjs';
import {filter,debounceTime,mergeMap,distinctUntilChanged} from 'rxjs/operators';


const searchTodos = async term =>{
  const todosResponse= await fetch("https://pokeapi.co/api/v2/pokemon/?limit=1000")
  const todos = await todosResponse.json();          
 
      console.log('term',todos.results);    
      const searchresult = todos.results.filter(todo => todo.name.includes(term));
      console.log(searchresult);
      return  searchresult;
} 

let searchSubject = new BehaviorSubject('');
let searchResultObservable = searchSubject.pipe(
  filter(val => val.length >1),
  debounceTime(750),
  distinctUntilChanged(),
  mergeMap(val => from(searchTodos(val)))
)


const useObservable = (observable ,setter)=>{
    useEffect(() => {
      let subscription = observable.subscribe(result=>{
        setter(result);
      })
      return () => {
        subscription.unsubscribe();
      }
    }, [observable,setter]);
}

function App () {

  const [search, setSearch] = useState('')
  const [results ,setResults] = useState([]);

  const handleChange = (e)=>{
    const newValue = e.target.value;
    setSearch(newValue.toLowerCase());   
    searchSubject.next(newValue.toLowerCase());
  }

  useObservable(searchResultObservable,setResults);

  return(

    <div className = "App">
      <input
       type = "text"
       placeholder = "search"
       value ={search}
       onChange = {handleChange}      
      />

    <div>{results.map(pokemon=>(
      <div key= {pokemon.name}>{pokemon.name}</div>
    ))}</div>
    </div>
  );

}

export default App;