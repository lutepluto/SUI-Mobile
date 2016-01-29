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
    objectToString = Object.prototype.toString,
    pageHistory = []

  var Push = function($page) {
    this.$leadPage = $page
    // this.originalUrl = location.href.split('#')[0]
    if (!this.$leadPage[0].id) {
      this.$leadPage[0].id = this.genRandomID()
    }
    // this.savePageHistory(this.$leadPage[0].id)
  }

  Push.prototype.genRandomID = function() {
    return "page-" + (+new Date())
  }

  Push.prototype.getCurrentPage = function() {
    return $('.page-current')
  }

  Push.prototype.getFirstPage = function() {
    return $('.page').first()
  }

  Push.prototype.getLastPage = function() {
    var last = pageHistory.pop()
    return last ? $('#' + last) : this.getFirstPage()
  }

  Push.prototype.savePageHistory = function(pageId) {
    pageHistory.push(pageId)
  }

  Push.prototype.transitionIn = function($remotePage, callback) {
    if (!$remotePage[0].id) {
      $remotePage[0].id = this.genRandomID()
    }

    // Adds current page class
    $remotePage.hasClass(currentPageClass) || $remotePage.addClass(currentPageClass)
    $remotePage.insertAfter($('.page').last())

    var $currentPage = this.getCurrentPage()
    this.savePageHistory($currentPage[0].id)  // save page history
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
    var $lastPage = this.getLastPage()

    // Tries to call before transition function
    options &&
      options.beforeTransition &&
      options.beforeTransition($lastPage, $remotePage)

    $lastPage.trigger('pageAnimationStart', [$remotePage[0].id, $remotePage])
      .removeClass(animPageClasses)
      .addClass(currentPageClass)
      .addClass('page-from-left-to-center')
    $remotePage.removeClass(animPageClasses)
      .removeClass(currentPageClass)
      .addClass('page-from-center-to-right')

    $lastPage.animationEnd(function() {
      $lastPage.removeClass(animPageClasses)
        .trigger('pageAnimationEnd', [$lastPage[0].id, $lastPage])
        .trigger('pageReinit', [$lastPage[0].id, $lastPage])
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
      $remotePage.find('*').off()
      $remotePage.off().remove()
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