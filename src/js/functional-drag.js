const clearLog = args => { console.log(args); return args }
const inOutLog = f => (...args) => clearLog(f(clearLog(...args)))

const prime = (f = x => x) => (...args) => () => f(...args)

const createElement = tag => document.createElement(tag)
const getBody = () => document.body
const getHead = () => document.head
const addChild = child => parent => { parent.appendChild(child); return parent }
const attachToParent = child => parent => { parent.appendChild(child); return child }

const when = event => callback => target => { target.addEventListener(event, callback); return target }
const whenDragStart = when('dragstart')
const whenDrop = when('drop')
const whenDragOver = when('dragover')

const attributeSetter = name => target => value => { target.setAttribute(name, value); return target }
const draggableSetter = attributeSetter('draggable')

const setDragee = target => { window.blackboard.dragee = target; return window.blackboard.dragee }
const getDragee = target => window.blackboard.dragee

const setDragGroup = groupName => target => { target.dragGroupName = groupName; return target }
const setDropGroup = groupName => target => { target.dropGroupName = groupName; return target }
const getDragGroup = target => target.dragGroupName
const getDropGroup = target => target.dropGroupName
const hasMatchingDragDropGroup = (dragee, dropee) => getDragGroup(dragee) === getDropGroup(dropee)

const setDragGroupAlpha = setDragGroup('alpha')
const setDropGroupAlpha = setDropGroup('alpha')

const thenSetEventDropEffect = effect => event => { event.preventDefault(); event.dataTransfer.dropEffect = effect }
const thenBeginDrag = event => setDragee(event.target)
const thenResolveDrop = event => {
  const dragee = getDragee()
  if (dragee) {
    if (hasMatchingDragDropGroup(getDragee(), event.currentTarget)) {
      event.preventDefault()
      addChild(dragee)(event.currentTarget)
      setDragee()
    }
  }
  return event.currentTarget
}

const setCanDragAway = whenDragStart(thenBeginDrag)
const setCanDropChildHere = whenDrop(thenResolveDrop)
const setIsMoveDestination = whenDragOver(thenSetEventDropEffect('move'))

const beDraggable = target => draggableSetter(target)('true')
const beMoveable = target => setDragGroupAlpha(setCanDragAway(target))
const beAMoveTarget = target => setDropGroupAlpha(setCanDropChildHere(setIsMoveDestination(target)))

const thenCreateElement = element => event => setDragee(element())
const thatSpawns = spawnee => whenDragStart(thenCreateElement(spawnee))
const beASpawnerOf = spawnee => target => thatSpawns(spawnee)(target)

const apply = (item, m) => m(item)
const mutate = (...mutators) => target => mutators.reduce(apply, target)

const addChildren = parent => children => mutate(...children.map(addChild))(parent)

const style = attribute => value => target => { target.style[attribute] = value; return target }
const lazyApplyAttribute = attribute => f => target => { target[attribute] = f(); return target }
const lazyApplyText = lazyApplyAttribute('innerText')
const lazyApplyClass = lazyApplyAttribute('className')
function * idString (string) {
  let id = 0
  while (true) {
    yield `${string} ${id}`
    id += 1
  }
}

const styleAttributeString = attribute => (...values) => `${attribute}: ${values.join(', ')};`
const styleRuleString = selector => (...attributes) => `${selector} {\n  ${attributes.join('\n  ')}\n}`
const setStyleRule = rule => stylesheet => { stylesheet.sheet.insertRule(rule, stylesheet.sheet.cssRules.length); return stylesheet }
const setStyleRules = (...rules) => stylesheet => { mutate(rules.map(setStyleRule))(stylesheet); return stylesheet }

const extract = key => f => () => f()[key]
const infiniteIds = text => { const idGenerator = idString(text); return idGenerator.next.bind(idGenerator) }
const infiniteNames = text => extract('value')(infiniteIds(text))

const div = (...mutators) => (...children) => addChildren(mutate(...mutators)(createElement('div')))(children)

const draggableDiv = div(
  lazyApplyText(infiniteNames('draggable')),
  lazyApplyClass(prime()('draggable')),
  beDraggable,
  beMoveable,
)

const dropzoneDiv = div(
  lazyApplyText(infiniteNames('droppable')),
  lazyApplyClass(prime()('dropzone')),
  beAMoveTarget,
)

const stackableDiv = div(
  lazyApplyText(infiniteNames('stackable')),
  lazyApplyClass(prime()('stackable')),
  beDraggable,
  beMoveable,
  beAMoveTarget,
)

const beADraggableSpawner = target => beASpawnerOf(draggableDiv)(target)

const draggableSpawner = div(
  lazyApplyText(infiniteNames('draggables')),
  lazyApplyClass(prime()('draggableSpawner')),
  beADraggableSpawner,
  beDraggable,
)

const beAStackableSpawner = target => beASpawnerOf(stackableDiv)(target)

const stackableSpawner = div(
  lazyApplyText(infiniteNames('stackables')),
  lazyApplyClass(prime()('stackableSpawner')),
  beAStackableSpawner,
  beDraggable,
)

export default () => {
  window.blackboard = {}
  mutate(
    setStyleRule(
      styleRuleString('.draggable')(
        styleAttributeString('box-shadow')('1px 1px 4px #666666'),
        styleAttributeString('padding')('5px'),
        styleAttributeString('margin')('5px'),
        styleAttributeString('user-select')('none'),
        styleAttributeString('cursor')('hand'),
        styleAttributeString('background-color')('#eeeeee'),
      ),
    ),
    setStyleRule(
      styleRuleString('.dropZone')(
        styleAttributeString('box-shadow')('1px 1px 4px #666666 inset'),
        styleAttributeString('padding')('5px'),
        styleAttributeString('margin')('5px'),
        styleAttributeString('user-select')('none'),
        styleAttributeString('cursor')('hand'),
        styleAttributeString('background-color')('#eeeeee'),
      )
    ),
    setStyleRule(
      styleRuleString('.stackable')(
        styleAttributeString('box-shadow')('1px 1px 4px #666666 inset, 1px 1px 4px #666666'),
        styleAttributeString('border')('2px #eeeeee solid'),
        styleAttributeString('padding')('4px'),
        styleAttributeString('margin')('4px'),
        styleAttributeString('user-select')('none'),
        styleAttributeString('cursor')('hand'),
        styleAttributeString('background-color')('#eeeeee'),
      )
    ),
    setStyleRule(
      styleRuleString('body')(
        styleAttributeString('background-color')('#eeeeee'),
      )
    )
  )(
    attachToParent(createElement('style'))(getHead())
  )
  addChild(
    dropzoneDiv(
      dropzoneDiv(
        draggableDiv(),
      ),
      dropzoneDiv(
        draggableDiv(),
        draggableDiv(),
        draggableDiv(),
        draggableDiv(),
        stackableDiv(),
      ),
      draggableSpawner(),
      stackableSpawner(),
    ),
  )(getBody())
}
