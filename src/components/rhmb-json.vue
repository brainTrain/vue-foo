<style scoped>
  .json-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }

  button {
    border: none;
    background: transparent;
    cursor: pointer;
  }
  
  textarea {
    height: 500px;
    margin-bottom: 20px;
  }
</style>

<template>
  <div>
    <h1>Get me some JSONz</h1>
    <div class="json-container">
      <div v-for="(topics, name) in JSONResults">
        <button v-on:click="toggleIsVisible(name)">
          <h3>{{ name }} ({{ topics.length }})</h3>
        </button>
        <div v-if="isVisible[name]">
          <p v-for="topic in topics">
            {{ topic }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'radiohead-gifs',
  data() {
    return {
      isVisible: {},
      JSONResults: {},
    };
  },
  created() {
    this.getJSON();
  },
  methods: {
    getJSON() {
      const apiServerBase = 'http://localhost:8000';
      const options = { crossdomain: true };
      const getJSONEndpoint = '/topic-json/';

      axios.get(`${apiServerBase}${getJSONEndpoint}`, options)
        .then(this.handleGetJSON)
        .catch(this.handleGetJSONError);
    },
    handleGetJSON(JSONResults) {
      const { data: { topicsByName } } = JSONResults;

      this.JSONResults = topicsByName;
    },
    handleGetJSONError(error) {
      // eslint-disable-next-line
    },
    toggleIsVisible(index) {
      // create shallow copy to replace existing data so vue can hook in to the changes
      const newIsVisible = { ...this.isVisible }
      const item = newIsVisible[index];
      item ? delete newIsVisible[index] : newIsVisible[index] = true;
      this.isVisible = newIsVisible;
    },
  },
};
</script>
