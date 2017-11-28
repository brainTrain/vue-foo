<template>
  <div>
    <h1>Get me some JSONz</h1>
    <div class="json-container">
      <textarea v-for="JSONResult in JSONResults" >
        {{ JSONResult }}
      </textarea>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'radiohead-gifs',
  data() {
    return {
      JSONResults: [],
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
      console.log('JSONResults', JSONResults)
      const { data } = JSONResults;

      this.JSONResults = data;
    },
    handleGetJSONError(error) {
      // eslint-disable-next-line
      console.error('oh noes, error getting json results :(', error);
    },
  },
};
</script>

<style scoped>
  .json-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }
  
  textarea {
    height: 200px;
    margin-bottom: 20px;
  }
</style>
