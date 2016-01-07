/**
 * Push.js
 * ---------------------------------------------
 * Copy page transition functions from router.js
 */

+function($) {

  var currentPageClass = 'page-current',
    animPageClasses = [
      'page-from-center-to-left',
      'page-from-center-to-right',
      'page-from-right-to-center',
      'page-from-left-to-center'
    ].join(' '),
    objectToString = Object.prototype.toString

  var Push = function($page) {
    this.$leadPage = $page
    this.originalUrl = location.href.split('#')[0]
    if (!this.$leadPage[0].id) {
      this.$leadPage[0].id = this.genRandomID()
    }
  }

  Push.prototype.genRandomID = function() {
    return "page-" + (+new Date())
  }

  Push.prototype.getCurrentPage = function() {
    return $('.page-current')
  }

  Push.prototype.transitionIn = function($remotePage, callback) {
    if (!$remotePage[0].id) {
      $remotePage[0].id = this.genRandomID()
    }
    // Adds current page class
    $remotePage.hasClass(currentPageClass) || $remotePage.addClass(currentPageClass)
    $remotePage.insertAfter($('.page')[0])

    var $currentPage = this.getCurrentPage()
    $remotePage.trigger('pageAnimationStart', [$remotePage[0].id, $remotePage])
    $currentPage.removeClass(animPageClasses)
      .removeClass(currentPageClass)
      .addClass('page-from-center-to-left')
    $remotePage.removeClass(animPageClasses)
      .addClass(currentPageClass)
      .addClass('page-from-right-to-center')

    $remotePage[0].clientWidth // force reflow

    var that = this
    $currentPage.animationEnd(function() {
      $currentPage.removeClass(animPageClasses)
    })
    $remotePage.animationEnd(function() {
      $remotePage.addClass(currentPageClass)
        .removeClass(animPageClasses)
        .trigger('pageAnimationEnd', [$remotePage[0].id, $remotePage])
        .trigger('pageInitInternal', [$remotePage[0].id, $remotePage])
        .one('click', '[data-dismiss="push"]', function(e) {
          that.transitionOut($remotePage)
        })

      callback && callback()
    })
  }

  Push.prototype.transitionOut = function($remotePage, options) {
    // Tries to call before transition function
    options &&
      options.beforeTransition &&
      options.beforeTransition(this.$leadPage, $remotePage)

    this.$leadPage.trigger('pageAnimationStart', [$remotePage[0].id, $remotePage])
      .removeClass(animPageClasses)
      .addClass(currentPageClass)
      .addClass('page-from-left-to-center')
    $remotePage.removeClass(animPageClasses)
      .removeClass(currentPageClass)
      .addClass('page-from-center-to-right')

    var that = this
    this.$leadPage.animationEnd(function() {
      that.$leadPage.removeClass(animPageClasses)
        .trigger('pageAnimationEnd', [that.$leadPage[0].id, that.$leadPage])
        .trigger('pageReinit', [that.$leadPage[0].id, that.$leadPage])
    })
    $remotePage.animationEnd(function() {
      $remotePage.removeClass(animPageClasses)
      
      // Tries to call after transition callback function
      if (/Function/.test(objectToString.call(options))) {
        options()
      } else {
        options && options.afterTransition && options.afterTransition()
      }

      // Removes remote page finally
      $remotePage.remove()
    })
  }

  $(function() {
    var $currentPage = $('.page-current'),
      $pushes = $currentPage.find('[data-toggle="push"]')

    if ($pushes.length) {
      $.push = new Push($currentPage)
    }
  })

}(Zepto)