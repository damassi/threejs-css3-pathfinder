HomeView = require 'views/HomeView'

describe 'HomeView', ->
  beforeEach ->
    @view = new HomeView();
    @view.render();

  afterEach ->
    @view.remove();

  it 'Should display an artist', ->
    expect(@view.$el.find '#artist').to.have.length 1

  it 'The artist should be Robert Ashley', ->  
  	expect(@view.$el.find('#artist').text()).to.equal 'Robert Ashley'

  it 'Should list seven operas', ->
    expect(@view.$el.find('#operas').find('li')).to.have.length 9
