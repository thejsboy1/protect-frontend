import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import 'styles/components/inputTags.css';


class InputTags extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        tags: [],
        removedTags:[]
      };
    }
    componentDidMount(){
      this.setState({
        tags:this.props.Tags
      });
    }
    removeTag = (i) => {
      // Copy current removed tags
      let rTags=[...this.state.removedTags];
      // Add newly removed tag
      rTags.push(this.state.tags[i]);
      // Push removed tags to EditTagsModal using Callback function
      this.props.UpdateRemoveTagsCallback(rTags);
      const newTags = [ ...this.state.tags ];
      newTags.splice(i, 1);
      this.setState({ tags: newTags ,removedTags:rTags});
    }
  
    inputKeyDown = (e) => {
      const val = e.target.value;
      if (e.key === 'Enter' && val) {
        if (this.state.tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
          return;
        }
        this.setState({ tags: [...this.state.tags, val]});
        this.props.UpdateAddTagsCallback([...this.state.tags,val]);
        this.tagInput.value = null;
      } else if (e.key === 'Backspace' && !val) {
        this.removeTag(this.state.tags.length - 1);
      }
    }
  
    render() {
      const { tags } = this.state;
      return (
        <div className="input-tag">
          <ul className="input-tag__tags">
            { tags.map((tag, i) => (
              <li key={tag}>
                {tag}
                <button type="button" onClick={() => { this.removeTag(i); }}>+</button>
              </li>
            ))}
            <li className="input-tag__tags__input"><input type="text" onKeyDown={this.inputKeyDown} ref={c => { this.tagInput = c; }} /></li>
          </ul>
        </div>
      );
    }
}
export default InputTags;