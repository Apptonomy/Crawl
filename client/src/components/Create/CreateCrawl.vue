<template>
  <div id="create">
    <ul id="crawl-forms">
      <div v-if="crawlId !== null">
        <h3>Send this crawl to your friends to have them join!</h3>
        <vs-input id="copy-url" icon-after="true" icon="content_copy" color="#d29362" :key="joinCrawlKey" v-on:icon-click="newCopyBehavior(joinCrawlUrl)" v-model="joinCrawlUrl"/>
      </div><br>
      <li>
        <div class="user-input-wrp expand">
          <br/>
      <!-- make App listen to changes in title by using emit and v-model -->
          <input class="form_field crawl-title" type="text" autocomplete="off" name="title" v-model="title" @input="$emit('update:title', title)" required/>
          <div class="border"></div>
          <span class="floating-label">Title</span>
        </div>
      </li>
      <br><br><br><br><br>
      <li>
        <div class="user-input-wrp expand">
          <br/>
          <input class="form_field crawl-time-date" type="datetime-local" name="datetime" v-model="crawlDate" @input="$emit('update:crawlDate', crawlDate)" required/>
          <div class="border"></div> 
        </div>
      </li>
      <br>
      <button id="save-crawl-button" v-on:click.stop="saveCrawl">
        Save crawl
      </button><br><br>
      
    </ul>

    <div>
      <google-map id="create-map" :selected.sync="selected"/>
  </div>

</template>

<script>
import axios from 'axios';
import 'material-icons/iconfont/material-icons.css';
import GoogleMap from '../GoogleMap'

export default {
  name: 'CreateCrawl',
  components: {
    GoogleMap,
  },
  data () {
    return {
      crawlDate: null,
      title: null,
      selected: [],
      crawlId: null,
      url: process.env.VUE_APP_MY_IP,
      joinCrawlUrl: "",
      joinCrawlKey: 0,
    }
  },
  methods: {
    //saves crawl to the database
    saveCrawl: function () {
      const { crawlDate, title } = this;
      const date = crawlDate.split("T")[0];
      const time = crawlDate.split("T")[1];
      let order = 1;
      axios.post(`/api/crawl/add`, {
        idCreator: this.$parent.user.id,
        title: title,
        crawlDate: date,
        crawlTime: time,
      })
        .then((response) => {
          // save locations to database, and store the crawlId that was just created
          this.crawlId = response.data.insertId;
          this.saveUserCrawl(this.$parent.user.id, this.crawlId);
          return this.saveLocations();
        })
        .then(() => {
          // get locations from the database
          const { selected } = this;
          const promises = selected.map((location) => 
            axios.get(`/api/location/${location.name}`)
          )
          //promise.all ensures each promise resolves before moving on
          return Promise.all(promises)
        })
        .then((data) => {
          // add locationId + crawlId + order to location_crawl table
          data.forEach((response) => {
            axios.post(`/api/join/lc/${response.data[0].Id}+${this.crawlId}+${order}`)
            order++;
          })
        })
        .then(() => {
          // update our global data so navbar can update
         axios.get(`/api/crawl/one/${this.$parent.user.id}`)
        .then((response) => {
          this.$store.createdCrawls = response.data;
         })
        })
        .catch((err) => {
          console.log(err, 'unable to save crawl');
        })
    },

    saveLocations: function () {
      const { selected } = this;
      // add locations to database
      const promises = selected.map((location) => {
        return axios.post(`/api/location/add`, location)
      });
      return Promise.all(promises);
    },

    saveUserCrawl: function(userId, crawlId) {
      axios.post(`/api/join/uc/${userId}+${crawlId}`)
        .then(() => {
        this.joinCrawlUrl = `https://crawl.southcentralus.cloudapp.azure.com:8081/#/crawl/joined/${this.$parent.user.id}/${this.title}/${this.crawlId}`.replace(/\s+/g, '');
        this.joinCrawlKey += 1;
          this.$vs.notify({
            title:'SAVED',
            text: 'YOUR CRAWL HAS BEEN ADDED',
            color:'success',
            icon:'check'
          })
        })
        .catch((err) => {
          console.log(err);
        })
    },

    newCopyBehavior: function(url) {
      // Overwrite what is being copied to the clipboard.
      document.addEventListener('copy', function(e) {

      /* e.clipboardData is initially empty, but we can set it to the
         data that we want copied onto the clipboard.*/
      e.clipboardData.setData('text/plain', url);
      console.log(url)

      /* This is necessary to prevent the current document selection from
         being written to the clipboard. */
      e.preventDefault();
      });
      this.copyToClipBoard();
    },

    copyToClipBoard: function() {
      document.execCommand("copy");
      console.log('COPIED:')
    }
  }
}
</script>

<style>
@import '../../assets/styles/createcrawl.scss';
</style>
